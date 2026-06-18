// Electron preload script — exposes a minimal, safe API to the renderer.
// This project is a game; most logic lives in React/Three.js, so the preload
// is intentionally minimal (window control only).

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  isElectron: true,
  platform: process.platform,

  // Window controls (if you add a custom title bar later)
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // Auto-update
  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update-available", (_event, info) => callback(info)),
  onUpdateDownloadProgress: (callback) =>
    ipcRenderer.on("update-download-progress", (_event, progress) =>
      callback(progress)
    ),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", (_event, info) => callback(info)),
  onUpdateError: (callback) =>
    ipcRenderer.on("update-error", (_event, error) => callback(error)),
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
});
