const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const isDev = !app.isPackaged;

// Disable GPU sandbox on Linux where it can cause issues with some distros
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
}

// ─── electron-log configuration ──────────────────────────
// Logs are written to:
//   macOS  : ~/Library/Logs/Eldoria/main.log
//   Windows: %USERPROFILE%\AppData\Roaming\Eldoria\logs\main.log
//   Linux  : ~/.config/Eldoria/logs/main.log
log.transports.file.level = "info";
log.transports.console.level = isDev ? "debug" : "info";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}";

let mainWindow = null;
let serverProcess = null;
let resolvedUrl = null;

// In production, the standalone directory is packed inside app.asar.
// Electron patches fs/require/process.chdir at the native level so that
// all I/O transparently reads from the ASAR archive.
// In dev, it's at .next/standalone/server.js relative to the project root.
function getServerPath() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone", "server.js");
  }
  return path.join(process.resourcesPath, "app.asar", "standalone", "server.js");
}

function getStandaloneDir() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone");
  }
  return path.join(process.resourcesPath, "app.asar", "standalone");
}

function getDbDir() {
  // In production, store the DB next to the app executable (user-writable)
  if (isDev) {
    return path.join(__dirname, "..", "db");
  }
  return path.join(app.getPath("userData"), "db");
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath();
    const standaloneDir = getStandaloneDir();

    // Ensure the public and static dirs exist in standalone for production.
    // Inside app.asar these dirs are read-only and already exist (copy-standalone-assets.mjs
    // copies them during build), so we only mkdir when NOT inside an ASAR.
    if (!isDev && !standaloneDir.includes("app.asar")) {
      const prodPublic = path.join(standaloneDir, "public");
      const prodStatic = path.join(standaloneDir, ".next", "static");
      if (!fs.existsSync(prodPublic)) fs.mkdirSync(prodPublic, { recursive: true });
      if (!fs.existsSync(prodStatic)) fs.mkdirSync(prodStatic, { recursive: true });
    }

    // Ensure DB directory exists
    const dbDir = getDbDir();
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const port = 0; // Let the OS pick a free port
    const env = {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
      DATABASE_URL: `file:${path.join(dbDir, "custom.db")}`,
    };

    // NOTE: cwd must be a REAL filesystem path (not inside app.asar)
    // because child_process.fork passes it to the OS-level chdir() syscall.
    // The Next.js standalone server calls process.chdir(__dirname) internally,
    // which Electron patches to work transparently inside ASAR.
    const cwd = isDev ? standaloneDir : process.resourcesPath;
    serverProcess = fork(serverPath, [], {
      cwd,
      env,
      silent: true,
    });

    let resolved = false;

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      log.info("[Server]", output.trim());

      // Next.js standalone prints "Ready on http://localhost:<port>"
      const match = output.match(/Ready on (https?:\/\/localhost:(\d+))/);
      if (match && !resolved) {
        resolved = true;
        resolve(match[1]);
      }
    });

    serverProcess.stderr.on("data", (data) => {
      log.error("[Server Error]", data.toString().trim());
    });

    serverProcess.on("error", (err) => {
      log.error("Failed to start server:", err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    serverProcess.on("exit", (code) => {
      log.info(`Server exited with code ${code}`);
      if (!resolved) {
        resolved = true;
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Fallback: if no "Ready on" message after 10s, fail with helpful error
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error(
          "Eldoria server did not start within 10s. " +
          "Make sure you ran 'bun run build' first to generate the standalone server."
        ));
      }
    }, 10000);
  });
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "Eldoria — 3D RPG Adventure",
    backgroundColor: "#0c0a07",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webgl: true,
      // Enable hardware acceleration for Three.js
      offscreen: false,
    },
  });

  mainWindow.loadURL(url);

  // Show window once content is ready (avoids white flash)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // ─── Auto-updater: forward events to the renderer ──────────
  if (!isDev) {
    initAutoUpdater();
  }
}

// ─── App lifecycle ───────────────────────────────────────────────

app.whenReady().then(async () => {
  log.info(`Eldoria v${app.getVersion()} starting (${isDev ? "dev" : "production"})`);
  try {
    if (isDev) {
      // In dev mode, the Next.js dev server is already running on port 3000
      // (started by concurrently via 'bun dev'). Just connect to it.
      resolvedUrl = "http://localhost:3000";
      log.info(`Connecting to dev server at ${resolvedUrl}`);
    } else {
      // In production, fork the standalone server ourselves
      const url = await startServer();
      resolvedUrl = url;
      log.info(`Server ready at ${url}`);
    }
    createWindow(resolvedUrl);
  } catch (err) {
    log.error("Failed to start Eldoria server:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

// ─── Auto-updater ──────────────────────────────────────────
// Only runs in packaged (production) builds.
// Uses GitHub Releases as the update source (publish config in electron-builder.yml).
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function initAutoUpdater() {
  // Wire electron-log into autoUpdater for persistent file logging
  autoUpdater.logger = log;

  autoUpdater.on("checking-for-update", () => {
    log.info("[Update] Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    log.info(`[Update] Available: v${info.version}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-available", {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    }
  });

  autoUpdater.on("update-not-available", () => {
    log.info("[Update] App is up to date.");
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(
      `[Update] Downloading: ${Math.round(progress.percent)}% ` +
        `(${Math.round(progress.bytesPerSecond / 1024)} KB/s)`
    );
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-download-progress", {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info(`[Update] Downloaded: v${info.version} — ready to install.`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-downloaded", {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    }
  });

  autoUpdater.on("error", (err) => {
    log.error("[Update] Error:", err.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-error", {
        message: err.message,
      });
    }
  });

  // Check for updates 3 seconds after the window is ready (non-blocking)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("[Update] Check failed:", err.message);
    });
  }, 3000);
}

// IPC: renderer requests a manual update check
ipcMain.on("check-for-updates", () => {
  if (!isDev) {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("[Update] Manual check failed:", err.message);
    });
  }
});

// IPC: renderer requests quit & install
ipcMain.on("quit-and-install", () => {
  autoUpdater.quitAndInstall(false, true);
});

// Re-create window on macOS dock click
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
    // Server should still be running; just re-create the window
    if (resolvedUrl) {
      createWindow(resolvedUrl);
    }
  }
});
