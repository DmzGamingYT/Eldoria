"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

/* -------------------------------------------------------------------------- */
/*  UpdateNotifier — listens to electron-updater IPC events via preload.js   */
/*  and renders a parchment-themed notification banner at the top of the      */
/*  screen. Only mounts in Electron (window.electronAPI exists).              */
/* -------------------------------------------------------------------------- */

interface UpdateInfo {
  version: string;
  releaseDate?: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

type UpdateState =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "error";

interface ElectronAPI {
  onUpdateAvailable: (cb: (info: UpdateInfo) => void) => void;
  onUpdateDownloadProgress: (cb: (progress: DownloadProgress) => void) => void;
  onUpdateDownloaded: (cb: (info: UpdateInfo) => void) => void;
  onUpdateError: (cb: (err: { message: string }) => void) => void;
  quitAndInstall: () => void;
  checkForUpdates: () => void;
}

function getElectronAPI(): ElectronAPI | null {
  if (typeof window === "undefined") return null;
  const api = (window as unknown as { electronAPI?: unknown }).electronAPI;
  return (api as ElectronAPI) ?? null;
}

/* ---------------- External store (module-scoped, browser-only) --------------
 * The Electron IPC API is a singleton. We keep the four pieces of updater
 * state in a module-level snapshot and notify all subscribers on each event.
 *
 * The component subscribes via `useSyncExternalStore` — the React 18+
 * official pattern for "subscribe to an external event source that only
 * exists after mount" (Electron preload IPC in our case). This replaces the
 * older `useState` + `useEffect` pattern that triggered the
 * `react-hooks/set-state-in-effect` lint error AND avoided the cascade of
 * two synchronous re-renders (one per setState).
 * -------------------------------------------------------------------------- */
interface NotifierSnapshot {
  state: UpdateState;
  info: UpdateInfo | null;
  progress: DownloadProgress | null;
  errorMsg: string;
}

const INITIAL_SNAPSHOT: NotifierSnapshot = {
  state: "idle",
  info: null,
  progress: null,
  errorMsg: "",
};

let snapshot: NotifierSnapshot = INITIAL_SNAPSHOT;
const listeners = new Set<() => void>();

// Lazy init:
//   undefined  → not yet probed (first client subscription will trigger it)
//   null       → probed and not in Electron
//   ElectronAPI → probed and bound
let cachedApi: ElectronAPI | null | undefined = undefined;

function notifyAll() {
  for (const l of listeners) l();
}

function bindApi(api: ElectronAPI) {
  api.onUpdateAvailable((info) => {
    snapshot = { ...snapshot, state: "available", info };
    notifyAll();
  });
  api.onUpdateDownloadProgress((progress) => {
    snapshot = { ...snapshot, state: "downloading", progress };
    notifyAll();
  });
  api.onUpdateDownloaded((info) => {
    snapshot = { ...snapshot, state: "downloaded", info };
    notifyAll();
  });
  api.onUpdateError((err) => {
    snapshot = { ...snapshot, state: "error", errorMsg: err.message };
    notifyAll();
  });
}

function getApi(): ElectronAPI | null {
  if (cachedApi !== undefined) return cachedApi;
  cachedApi = getElectronAPI();
  if (cachedApi) bindApi(cachedApi);
  return cachedApi;
}

/** `useSyncExternalStore` subscribe impl. Lazy-binds the api on the first
 *  client subscription so handlers are registered exactly once, only in
 *  the browser (never on the SSR pass). */
function subscribe(notify: () => void): () => void {
  listeners.add(notify);
  if (typeof window !== "undefined") getApi();
  return () => {
    listeners.delete(notify);
  };
}

/** `useSyncExternalStore` getSnapshot impl. Module-level fn → stable
 *  reference identity, which lets React detect updates by reference. */
function getClientSnapshot(): NotifierSnapshot {
  return snapshot;
}

/** `useSyncExternalStore` getServerSnapshot impl. Static SSR snapshot
 *  so React renders the same value on the SSR pass and the initial
 *  client hydration tick → no hydration mismatch warning. */
function getServerSnapshot(): NotifierSnapshot {
  return INITIAL_SNAPSHOT;
}

export function UpdateNotifier() {
  const update = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => setDismissed(true), []);
  const handleInstall = useCallback(() => {
    getApi()?.quitAndInstall();
  }, []);

  // Early returns AFTER all hooks — respects rules of hooks
  if (dismissed) return null;
  if (update.state === "idle") return null;

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-4 z-[60] w-[92%] max-w-lg -translate-x-1/2"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div
        className="parchment-banner relative overflow-hidden p-4 text-[var(--parchment-ink)]"
        style={{
          boxShadow:
            "0 0 0 1px var(--gold-2) inset, 0 8px 32px rgba(60,30,10,0.55), 0 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* ─── Available ─── */}
        {update.state === "available" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">⬆️</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Mise à jour disponible
              </span>
              <span className="ml-auto rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] px-1.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                v{update.info?.version}
              </span>
            </div>
            <p className="mb-3 text-xs italic text-[var(--parchment-ink-soft)]">
              Téléchargement automatique en cours…
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="ink-btn flex-1 !py-1.5 !text-xs"
              >
                Ignorer
              </button>
            </div>
          </>
        )}

        {/* ─── Downloading ─── */}
        {update.state === "downloading" && update.progress && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl" style={{ animation: "float 2s ease-in-out infinite" }}>
                📥
              </span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Téléchargement…
              </span>
              <span className="ml-auto font-serif text-[11px] font-bold text-[var(--gold-3)]">
                {Math.round(update.progress.percent)}%
              </span>
            </div>
            {/* Progress bar — parchment style */}
            <div
              className="relative mb-1.5 h-3 overflow-hidden rounded-full"
              style={{
                border: "2px solid var(--gold-4)",
                background: "rgba(255,245,215,0.3)",
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, update.progress.percent)}%`,
                  background:
                    "linear-gradient(90deg, var(--gold-3), var(--gold-1))",
                  boxShadow: "0 0 8px rgba(246,217,124,0.5)",
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[var(--parchment-ink-soft)]">
              <span>
                {formatBytes(update.progress.transferred)} / {formatBytes(update.progress.total)}
              </span>
              <span>{formatBytes(update.progress.bytesPerSecond)}/s</span>
            </div>
            <button
              onClick={handleDismiss}
              className="ink-btn mt-2 w-full !py-1 !text-xs"
            >
              Ignorer
            </button>
          </>
        )}

        {/* ─── Downloaded — ready to install ─── */}
        {update.state === "downloaded" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Prêt à installer
              </span>
              <span className="ml-auto rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] px-1.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                v{update.info?.version}
              </span>
            </div>
            <p className="mb-3 text-xs italic text-[var(--parchment-ink-soft)]">
              La mise à jour sera installée au prochain redémarrage.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="ink-btn flex-1 !py-1.5 !text-xs"
              >
                Plus tard
              </button>
              <button
                onClick={handleInstall}
                className="gold-btn flex-1 !py-1.5 !text-xs"
              >
                ⚔ Redémarrer maintenant
              </button>
            </div>
          </>
        )}

        {/* ─── Error ─── */}
        {update.state === "error" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Erreur de mise à jour
              </span>
            </div>
            <p className="mb-3 text-xs text-[var(--parchment-ink-soft)]">
              {update.errorMsg || "Une erreur est survenue lors de la vérification."}
            </p>
            <button
              onClick={handleDismiss}
              className="ink-btn w-full !py-1.5 !text-xs"
            >
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
