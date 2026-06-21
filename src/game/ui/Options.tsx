"use client";

import { useState } from "react";
import { useGame } from "../store";
import { ParchmentModal, GoldButton, InkButton, GoldRule, Eyebrow } from "./parchment";
import { RefreshCw, ExternalLink, Info } from "lucide-react";

export function Options() {
  const show = useGame((s) => s.ui.options);
  const closePanel = useGame((s) => s.closePanel);
  const showToast = useGame((s) => s.showToast);
  const [checking, setChecking] = useState(false);

  if (!show) return null;

  // Detect Electron environment
  const api =
    typeof window !== "undefined"
      ? (window as unknown as { electronAPI?: Record<string, unknown> }).electronAPI
      : null;
  const isElectron = !!api;

  const handleCheckUpdate = () => {
    if (!api) {
      showToast("Mises à jour disponibles sur GitHub", "info");
      return;
    }
    setChecking(true);
    const apiTyped = api as { checkForUpdates: () => void };
    apiTyped.checkForUpdates();
    showToast("Recherche de mises à jour…", "info");
    // Reset after a short delay (the updater will notify via UpdateNotifier)
    setTimeout(() => setChecking(false), 3000);
  };

  const handleOpenGitHub = () => {
    window.open("https://github.com/DmzGamingYT/Eldoria/releases", "_blank");
  };

  return (
    <ParchmentModal
      eyebrow="Configuration"
      title="Options"
      onClose={() => closePanel("options")}
      width="max-w-md"
    >
      <div className="space-y-5">
        {/* ─── Mises à jour ─── */}
        <div>
          <Eyebrow className="block">◈ Mises à jour ◈</Eyebrow>
          <div className="mt-3 space-y-2.5">
            <GoldButton onClick={handleCheckUpdate} fullWidth disabled={checking}>
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Recherche en cours…" : "Vérifier les mises à jour"}
              </span>
            </GoldButton>
            <InkButton onClick={handleOpenGitHub} fullWidth>
              <span className="flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Voir les releases sur GitHub
              </span>
            </InkButton>
          </div>
        </div>

        <GoldRule />

        {/* ─── À propos ─── */}
        <div>
          <Eyebrow className="block">◈ À propos ◈</Eyebrow>
          <div className="mt-3 rounded-lg border border-[var(--gold-4)] bg-[rgba(255,245,215,0.25)] p-3 text-sm">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--gold-3)]" />
              <span className="font-serif font-bold text-[var(--parchment-ink)]">Eldoria</span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--parchment-ink-soft)]">
              Chroniques de la Forêt d'Argent
            </p>
            <p className="mt-1 text-xs text-[var(--parchment-ink-soft)]">
              Version 0.2.5 · RPG fantasy 3D
            </p>
            <p className="mt-1 text-xs text-[var(--parchment-ink-soft)]">
              © 2026 DmzGamingYT
            </p>
            <p className="mt-1 text-[10px] text-[var(--parchment-ink-soft)] opacity-70">
              {isElectron ? "Application de bureau Electron" : "Navigateur web"}
            </p>
          </div>
        </div>
      </div>
    </ParchmentModal>
  );
}
