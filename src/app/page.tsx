"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/game/Game").then((m) => m.Game), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-amber-300">
      <div className="text-center">
        <div className="mb-3 text-5xl" style={{ animation: "spin 1.5s linear infinite" }}>⚔️</div>
        <div className="text-sm tracking-widest">ENTERING ELDORIA...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
