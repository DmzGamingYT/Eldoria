"use client";

import { useGame } from "../store";
import {
  ParchmentModal,
  GoldButton,
  InkButton,
  GoldRule,
  Eyebrow,
} from "./parchment";

export function MainMenu() {
  const status = useGame((s) => s.status);
  const startGame = useGame((s) => s.startGame);
  const loadGame = useGame((s) => s.loadGame);
  const hasSave = useGame((s) => s.hasSave());
  const player = useGame((s) => s.player);
  const resume = useGame((s) => s.resume);
  const saveGame = useGame((s) => s.saveGame);

  if (status === "playing" || status === "intro") return null;

  /* -------------------- Paused -------------------- */
  if (status === "paused") {
    return (
      <ParchmentModal
        eyebrow="Le voyage est suspendu"
        title="En Pause"
        onClose={resume}
        width="max-w-md"
      >
        <p className="mb-5 text-center text-sm italic text-[var(--parchment-ink-soft)]">
          « L'aventure vous attend, héros d'Eldoria. »
        </p>
        <div className="space-y-2.5">
          <GoldButton onClick={resume} fullWidth>
            ▶ Reprendre l'aventure
          </GoldButton>
          <InkButton onClick={() => saveGame()} fullWidth>
            💾 Sauvegarder la partie
          </InkButton>
          <InkButton onClick={() => startGame()} fullWidth>
            🔄 Nouvelle partie
          </InkButton>
        </div>
        <p className="mt-5 text-center text-[10px] tracking-wider text-[var(--parchment-ink-soft)] opacity-70">
          Touche Échap pour reprendre
        </p>
      </ParchmentModal>
    );
  }

  /* -------------------- Game Over -------------------- */
  if (status === "gameover") {
    return (
      <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
           style={{ animation: "fadeIn 0.3s ease-out" }}>
        <div
          className="parchment-panel max-w-md p-6 text-[var(--parchment-ink)]"
          style={{
            animation: "panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            borderColor: "var(--crimson)",
            boxShadow:
              "0 0 0 1px var(--crimson) inset, 0 0 0 6px rgba(161,58,42,0.15) inset, 0 12px 38px rgba(80, 10, 10, 0.55), 0 0 60px rgba(0,0,0,0.6)",
          }}
        >
          <div className="mb-2 text-center text-6xl" style={{ animation: "pulseRed 1.4s ease-in-out infinite" }}>
            💀
          </div>
          <Eyebrow>Fin de chapitre</Eyebrow>
          <h2 className="mb-2 text-center font-serif text-3xl font-black text-[var(--crimson)]">
            Vous êtes tombé
          </h2>
          <p className="mb-4 text-center text-sm italic text-[var(--parchment-ink-soft)]">
            Le héros a succombé aux ténèbres…
          </p>
          <GoldRule />
          <div className="mb-5 space-y-1 text-sm">
            <StatRow k="Niveau atteint" v={String(player.level)} />
            <StatRow k="Ennemis vaincus" v={String(player.killCount)} />
            <StatRow k="Pièces d'or" v={`${player.gold} po`} />
          </div>
          <GoldButton onClick={() => startGame()} fullWidth>
            ⚔ Tenter une nouvelle destinée
          </GoldButton>
        </div>
      </div>
    );
  }

  /* -------------------- Victory -------------------- */
  if (status === "victory") {
    return (
      <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
           style={{ animation: "fadeIn 0.3s ease-out" }}>
        <div
          className="parchment-panel max-w-md p-6 text-[var(--parchment-ink)]"
          style={{
            animation: "panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow:
              "0 0 0 1px var(--gold-2) inset, 0 0 0 6px rgba(246,217,124,0.12) inset, 0 0 30px rgba(246, 217, 124, 0.25), 0 12px 38px rgba(60,30,10,0.55), 0 0 60px rgba(0,0,0,0.55)",
          }}
        >
          <div className="mb-2 text-center text-6xl" style={{ animation: "bounce 1.2s ease-in-out infinite" }}>
            🏆
          </div>
          <Eyebrow>Fin de la quête</Eyebrow>
          <h2 className="mb-3 text-center font-serif text-4xl font-black text-[var(--gold-3)]"
              style={{ textShadow: "0 0 16px rgba(246, 217, 124, 0.55)" }}>
            Victoire !
          </h2>
          <p className="mb-5 text-center text-sm italic text-[var(--parchment-ink-soft)]">
            Mordrak le Seigneur des Ombres est vaincu. Eldoria est enfin libérée
            du jumeau maléfique de l&apos;Arbre d&apos;Argent.
          </p>
          <GoldRule />
          <p className="mb-4 text-center text-xs">
            Votre nom sera chanté dans les tavernes de la Borderlands pendant
            mille hivers.
          </p>
          <GoldButton onClick={() => startGame()} fullWidth>
            ⚔ Entreprendre une nouvelle aventure
          </GoldButton>
        </div>
      </div>
    );
  }

  /* -------------------- Main splash -------------------- */
  return (
    <div className="hero-root absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* --- Background layers --- */}
      <div className="hero-bg" />
      <div className="hero-vignette" />

      {/* Light rays */}
      <div className="hero-rays">
        {[15, 35, 50, 65, 85].map((left, i) => (
          <span key={i} className="hero-ray" style={{
            left: `${left}%`,
            height: `${50 + Math.random() * 25}%`,
            transform: `rotate(${-8 + i * 4}deg)`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            width: `${1 + Math.random()}px`,
          }} />
        ))}
      </div>

      {/* Starfield */}
      <div className="hero-stars">
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="hero-star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${0.8 + Math.random() * 1.2}px`,
            height: `${0.8 + Math.random() * 1.2}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Floating embers */}
      <div className="hero-particles">
        {Array.from({ length: 22 }).map((_, i) => {
          const size = 1.2 + Math.random() * 2;
          const drift = -25 + Math.random() * 50;
          return (
            <span key={i} className="hero-particle" style={{
              left: `${8 + Math.random() * 84}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${9 + Math.random() * 8}s`,
              ["--ember-drift" as string]: `${drift}px`,
            }} />
          );
        })}
      </div>

      {/* --- Content --- */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 py-8 text-center">

        {/* Sword icon */}
        <div className="hero-sword" style={{ animationDelay: "0.1s" }}>
          <span className="text-5xl sm:text-6xl" style={{ animation: "float 4s ease-in-out infinite" }}>⚔️</span>
        </div>

        {/* Eyebrow */}
        <div className="hero-fade" style={{ animationDelay: "0.3s" }}>
          <Eyebrow className="!text-[0.65rem]">L&apos;Ombre du Seigneur Noir</Eyebrow>
        </div>

        {/* Title */}
        <h1 className="hero-title hero-fade" style={{ animationDelay: "0.5s" }}>
          ELDORIA
        </h1>

        {/* Decorative sword divider */}
        <div className="hero-fade hero-divider" style={{ animationDelay: "0.7s" }}>
          <span className="divider-line" />
          <span className="divider-icon">⚜</span>
          <span className="divider-line" />
        </div>

        {/* Subtitle */}
        <h2 className="hero-fade hero-subtitle" style={{ animationDelay: "0.85s" }}>
          Chroniques de la Forêt d&apos;Argent
        </h2>

        {/* Tagline */}
        <p className="hero-fade hero-tagline" style={{ animationDelay: "1s" }}>
          Un RPG fantasy en trois dimensions
        </p>

        {/* Buttons */}
        <div className="hero-fade mx-auto mt-6 mb-8 w-full max-w-xs space-y-3" style={{ animationDelay: "1.15s" }}>
          <GoldButton onClick={() => startGame()} fullWidth>
            Commencer une nouvelle quête
          </GoldButton>
          {hasSave && (
            <InkButton onClick={() => loadGame()} fullWidth>
              Reprendre le manuscrit
            </InkButton>
          )}
        </div>

        {/* Lore card */}
        <div className="hero-fade hero-lore" style={{ animationDelay: "1.35s" }}>
          <div className="parchment-paper rounded-xl p-5 text-left text-sm leading-relaxed text-[var(--parchment-ink)]">
            <Eyebrow>◈ La Légende ◈</Eyebrow>
            <p className="mt-2">
              Autrefois, le royaume d&apos;Eldoria prospérait sous la lumière de
              l&apos;<em>Arbre d&apos;Argent</em>. Mais voici trois hivers, le sorcier{' '}
              <strong>Mordrak</strong> a brisé le sceau ancien et déchaîné ses
               armées sur les terres des hommes. Les villages brûlent, les ombres
              s&apos;allongent, et les héros d&apos;antan ont disparu. Vous êtes le dernier
              porteur d&apos;espoir : forgez votre légende, terrassez les ténèbres, et
              rendez la paix à Eldoria — ou périssez en essayant.
            </p>
          </div>
        </div>

        {/* Controls hint */}
        <p className="hero-fade mt-5 text-[10px] tracking-wider text-[var(--parchment-1)] opacity-60" style={{ animationDelay: "1.5s" }}>
          <kbd className="kbd">WASD</kbd> Bouger
          <span className="mx-1.5 opacity-40">·</span>
          <kbd className="kbd">Espace</kbd> Attaquer
          <span className="mx-1.5 opacity-40">·</span>
          <kbd className="kbd">E</kbd> Interagir
        </p>
      </div>
    </div>
  );
}

function StatRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dotted border-[var(--gold-4)] py-1">
      <span className="text-[var(--parchment-ink-soft)]">{k}</span>
      <span className="font-serif text-base font-bold text-[var(--gold-3)]">{v}</span>
    </div>
  );
}

export function HelpPanel() {
  const show = useGame((s) => s.ui.help);
  const closePanel = useGame((s) => s.closePanel);
  if (!show) return null;
  return (
    <ParchmentModal
      eyebrow="Manuel de l'aventurier"
      title="Comment jouer"
      onClose={() => closePanel("help")}
      width="max-w-lg"
    >
      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <Eyebrow>◈ Contrôles</Eyebrow>
          <div className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
            <Key tag="W A S D" desc="Se déplacer" />
            <Key tag="Maj" desc="Courir plus vite" />
            <Key tag="Espace / J" desc="Attaquer avec votre arme" />
            <Key tag="Clic souris" desc="Tourner la caméra" />
            <Key tag="Molette" desc="Zoomer la caméra" />
            <Key tag="[ ]" desc="Tourner la caméra au clavier" />
            <Key tag="E" desc="Parler à un PNJ / ouvrir un magasin" />
            <Key tag="1 2 3" desc="Utiliser une potion de la barre rapide" />
          </div>
        </div>
        <div>
          <Eyebrow>◈ Panneaux</Eyebrow>
          <div className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5">
            <Key tag="I" desc="Ouvrir l'inventaire" />
            <Key tag="Q" desc="Ouvrir le journal de quêtes" />
            <Key tag="C" desc="Ouvrir la fiche du personnage" />
            <Key tag="T" desc="Ouvrir l'Arbre de Talents (v0.3.0)" />
            <Key tag="H / ?" desc="Afficher / masquer cette aide" />
            <Key tag="Échap" desc="Fermer un panneau / mettre en pause" />
            <Key tag="F5" desc="Sauvegarder" />
          </div>
        </div>
      <div>
        <Eyebrow>◈ Astuces du barde</Eyebrow>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--parchment-ink)]">
          <li>Équipez armes et armures pour améliorer vos stats — cliquez sur un objet puis « Équiper ».</li>
          <li>Vainquez des ennemis pour gagner de l'XP et de l'or ; montez de niveau pour devenir plus fort.</li>
          <li>Appuyez sur <kbd className="rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.5)] px-1 font-serif text-[10px] font-bold text-[var(--gold-3)]">T</kbd> pour dépenser vos points dans l'Arbre de Talents (3 branches : Combat, Magie, Survie).</li>
          <li>Parlez aux PNJ (touche E à proximité) pour accepter et rendre des quêtes.</li>
          <li>Le Seigneur des Ombres Mordrak attend derrière la porte du donjon nord.</li>
          <li>Ramassez les orbes de butin (octaèdres) en passant dessus.</li>
        </ul>
      </div>
      </div>
    </ParchmentModal>
  );
}

function Key({ tag, desc }: { tag: string; desc: string }) {
  return (
    <>
      <kbd className="rounded border border-[var(--gold-4)] bg-[rgba(255,245,215,0.45)] px-2 py-0.5 text-center font-serif text-[11px] font-bold tracking-wider text-[var(--parchment-ink)]">
        {tag}
      </kbd>
      <span className="self-center text-sm text-[var(--parchment-ink-soft)]">{desc}</span>
    </>
  );
}
