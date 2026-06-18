"use client";

import { useState, useEffect, useCallback } from "react";

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

export function UpdateNotifier() {
  const [state, setState] = useState<UpdateState>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [apiRef, setApiRef] = useState<ElectronAPI | null>(null);

  // All hooks must be declared unconditionally before any early returns
  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;
    setApiRef(api);
    setApiReady(true);

    api.onUpdateAvailable((info) => {
      setState("available");
      setUpdateInfo(info);
      setDismissed(false);
    });

    api.onUpdateDownloadProgress((p) => {
      setState("downloading");
      setProgress(p);
    });

    api.onUpdateDownloaded((info) => {
      setState("downloaded");
      setUpdateInfo(info);
    });

    api.onUpdateError((err) => {
      setState("error");
      setErrorMsg(err.message);
    });
  }, []);

  const handleDismiss = useCallback(() => setDismissed(true), []);
  const handleInstall = useCallback(() => {
    apiRef?.quitAndInstall();
  }, [apiRef]);

  // Early returns AFTER all hooks — respects rules of hooks
  if (!apiReady || !apiRef) return null;
  if (dismissed) return null;
  if (state === "idle") return null;

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
        {state === "available" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">⬆️</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Mise à jour disponible
              </span>
              <span className="ml-auto rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] px-1.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                v{updateInfo?.version}
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
        {state === "downloading" && progress && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl" style={{ animation: "float 2s ease-in-out infinite" }}>
                📥
              </span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Téléchargement…
              </span>
              <span className="ml-auto font-serif text-[11px] font-bold text-[var(--gold-3)]">
                {Math.round(progress.percent)}%
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
                  width: `${Math.min(100, progress.percent)}%`,
                  background:
                    "linear-gradient(90deg, var(--gold-3), var(--gold-1))",
                  boxShadow: "0 0 8px rgba(246,217,124,0.5)",
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[var(--parchment-ink-soft)]">
              <span>
                {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
              </span>
              <span>{formatBytes(progress.bytesPerSecond)}/s</span>
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
        {state === "downloaded" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Prêt à installer
              </span>
              <span className="ml-auto rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.4)] px-1.5 font-serif text-[10px] font-bold text-[var(--gold-3)]">
                v{updateInfo?.version}
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
        {state === "error" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-serif text-sm font-bold text-[var(--parchment-ink)]">
                Erreur de mise à jour
              </span>
            </div>
            <p className="mb-3 text-xs text-[var(--parchment-ink-soft)]">
              {errorMsg || "Une erreur est survenue lors de la vérification."}
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
