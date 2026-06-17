const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");

// Disable GPU sandbox on Linux where it can cause issues with some distros
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
}

let mainWindow = null;
let serverProcess = null;
let resolvedUrl = null;

const isDev = !app.isPackaged;

// In production, the standalone server is shipped next to this main.js
// In dev, it's at .next/standalone/server.js relative to the project root
function getServerPath() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone", "server.js");
  }
  // Packaged: server.js is in the same directory tree
  return path.join(process.resourcesPath, "standalone", "server.js");
}

function getStandaloneDir() {
  if (isDev) {
    return path.join(__dirname, "..", ".next", "standalone");
  }
  return path.join(process.resourcesPath, "standalone");
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

    // Ensure the public and static dirs exist in standalone for production
    if (!isDev) {
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

    serverProcess = fork(serverPath, [], {
      cwd: standaloneDir,
      env,
      silent: true,
    });

    let resolved = false;

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("[Eldoria Server]", output);

      // Next.js standalone prints "Ready on http://localhost:<port>"
      const match = output.match(/Ready on (https?:\/\/localhost:(\d+))/);
      if (match && !resolved) {
        resolved = true;
        resolve(match[1]);
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("[Eldoria Server Error]", data.toString());
    });

    serverProcess.on("error", (err) => {
      console.error("Failed to start server:", err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    serverProcess.on("exit", (code) => {
      console.log(`Server exited with code ${code}`);
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
}

// ─── App lifecycle ───────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    if (isDev) {
      // In dev mode, the Next.js dev server is already running on port 3000
      // (started by concurrently via 'bun dev'). Just connect to it.
      resolvedUrl = "http://localhost:3000";
      console.log(`[Eldoria Dev] Connecting to dev server at ${resolvedUrl}`);
    } else {
      // In production, fork the standalone server ourselves
      const url = await startServer();
      resolvedUrl = url;
      console.log(`Eldoria server ready at ${url}`);
    }
    createWindow(resolvedUrl);
  } catch (err) {
    console.error("Failed to start Eldoria server:", err);
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

// Re-create window on macOS dock click
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
    // Server should still be running; just re-create the window
    if (resolvedUrl) {
      createWindow(resolvedUrl);
    }
  }
});
