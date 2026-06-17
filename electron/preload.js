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
});
