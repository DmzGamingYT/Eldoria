"use client";

import { useState, useEffect, useCallback } from "react";
import { useGame } from "../store";

const INTRO_LINES = [
  "Depuis trois hivers, les ténèbres règnent sur Eldoria.",
  "Le sorcier Mordrak a brisé le sceau ancien.",
  "Les villages brûlent. Les ombres s'allongent.",
  "Les héros d'antan ont disparu.",
  "",
  "Vous êtes le dernier espoir.",
  "Le dernier porteur de la lumière.",
  "",
  "Forgez votre légende.",
  "Terrassez les ténèbres.",
  "Rendez la paix à Eldoria.",
  "Ou périssez en essayant.",
];

/** Lines that get the dramatic scale + gold color treatment. */
const DRAMATIC_LINES = new Set([5, 8, 11]); // 0-indexed: "Vous êtes le dernier espoir.", "Forgez votre légende.", "Ou périssez en essayant.");

export function Intro() {
  const status = useGame((s) => s.status);
  const [lineIndex, setLineIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(true);

  const finishIntro = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      useGame.setState({ status: "playing" });
    }, 1000);
  }, []);

  const advance = useCallback(() => {
    if (!ready || fadeOut) return;
    if (lineIndex < INTRO_LINES.length) {
      setReady(false);
      setLineIndex((prev) => prev + 1);
      // Brief cooldown so rapid clicks don't skip lines
      setTimeout(() => setReady(true), 300);
    }
  }, [lineIndex, ready, fadeOut]);

  useEffect(() => {
    if (status !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, advance]);

  if (status !== "intro") return null;

  const allShown = lineIndex >= INTRO_LINES.length;

  return (
    <div
      className={`intro-root ${fadeOut ? "intro-fadeout" : ""}`}
      onClick={allShown ? undefined : advance}
    >
      <div className="intro-bg" />
      <div className="intro-vignette" />

      {/* Particles */}
      <div className="intro-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="intro-particle" style={{
            left: `${15 + Math.random() * 70}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${7 + Math.random() * 6}s`,
          }} />
        ))}
      </div>

      {/* Text container */}
      <div className="intro-content">
        {INTRO_LINES.map((text, i) => {
          if (text === "") {
            return <div key={i} className="intro-spacer" />;
          }
          const isVisible = i < lineIndex;
          const isCurrent = i === lineIndex - 1;
          const isDramatic = DRAMATIC_LINES.has(i);
          return (
            <p
              key={i}
              className={`intro-line ${isVisible ? "intro-line-visible" : ""} ${isCurrent ? "intro-line-current" : ""} ${isDramatic && isVisible ? "intro-dramatic" : ""}`}
            >
              {text}
              {isCurrent && <span className="intro-cursor" />}
            </p>
          );
        })}
      </div>

      {/* Continue / Start prompt */}
      {!allShown ? (
        <div className="intro-continue">
          <span className="intro-continue-text">Cliquez ou appuyez sur Espace</span>
          <span className="intro-continue-arrow">▸</span>
        </div>
      ) : (
        <button className="intro-start-btn" onClick={finishIntro}>
          Commencer l'aventure
        </button>
      )}

      {/* Skip button */}
      <button className="intro-skip" onClick={finishIntro}>
        Passer ▸
      </button>

      {/* Decorative bottom ornament */}
      <div className="intro-ornament">⚜</div>
    </div>
  );
}
