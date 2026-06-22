"use client";

// v0.3.0 SkillTree panel — three-column parchment layout with SVG links
// between prerequisites and clickable talent nodes. Uses the project's
// `parchment-*` design system (PanelShell, Eyebrow, GoldRule) so it blends
// with the existing CharacterSheet and Inventory visuals.

import { useMemo } from "react";
import { useGame } from "../store";
import {
  BRANCH_META,
  TALENTS,
  getTalent,
  isTalentAvailable,
  pointsInBranch,
} from "../data/talents";
import type { TalentBranch, TalentDef } from "../types";
import { PanelShell, Eyebrow, GoldRule } from "./parchment";
import { Sparkles, Crown, Star } from "lucide-react";

// Layout constants for the SVG connectors between nodes.
const COL_X: Record<TalentBranch, number> = {
  combat: 130,
  magic: 320,
  survival: 510,
};
const COL_WIDTH = 200;
const NODE_W = 168;
const NODE_H = 80;
const TOP_PAD = 110;
const ROW_GAP = 110;

const BRANCH_ORDER: TalentBranch[] = ["combat", "magic", "survival"];

export function SkillTree() {
  const show = useGame((s) => s.ui.talents);
  const closePanel = useGame((s) => s.closePanel);

  if (!show) return null;

  return (
    <PanelShell
      eyebrow="❦ Trois arts arcaniques ❦"
      title="Arbre de Talents"
      onClose={() => closePanel("talents")}
      width="max-w-5xl"
    >
      <div className="space-y-3">
        <HeaderBar />
        <GoldRule />
        <TreeBody />
        <GoldRule />
        <FooterHint />
      </div>
    </PanelShell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

function HeaderBar() {
  const points = useGame((s) => s.player.talentPoints);
  const level = useGame((s) => s.player.level);
  const hasPoints = points > 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-[var(--gold-3)] bg-[var(--gold-1)]/35 px-4 py-3">
      <div className="flex items-center gap-3">
        <Sparkles
          className={`h-6 w-6 ${hasPoints ? "text-[var(--gold-3)]" : "text-[var(--gold-3)] opacity-50"}`}
        />
        <div>
          <Eyebrow>Points de talent</Eyebrow>
          <div className="flex items-baseline gap-2">
            <span
              className="font-serif text-3xl font-black"
              style={{
                color: hasPoints ? "var(--gold-3)" : "var(--parchment-ink-soft)",
                textShadow: hasPoints ? "0 0 12px rgba(246,217,124,0.5)" : "none",
              }}
            >
              {points}
            </span>
            <span className="font-serif text-xs italic text-[var(--parchment-ink-soft)]">
              disponibles · niveau {level}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <Eyebrow>Obtention</Eyebrow>
        <p className="max-w-sm font-serif text-[11px] italic leading-snug text-[var(--parchment-ink-soft)]">
          1 point à chaque niveau, +1 bonus tous les 5 niveaux.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Tree Body                                 */
/* -------------------------------------------------------------------------- */

function TreeBody() {
  const level = useGame((s) => s.player.level);
  const alloc = useGame((s) => s.player.allocatedTalents);
  const points = useGame((s) => s.player.talentPoints);

  // Pre-compute each branch's nodes laid out by tier (visual row order).
  const branches = useMemo(
    () =>
      BRANCH_ORDER.map((branch) => {
        const nodes = TALENTS.filter((t) => t.branch === branch).sort(
          (a, b) => a.tier - b.tier,
        );
        return { branch, nodes };
      }),
    [],
  );
  const rowsByTier = useMemo(() => {
    const tiers = new Map<number, number>();
    let y = 0;
    let prevTier = -1;
    for (const list of [TALENTS]) {
      // Single pool ordered by tier desc → ensures the deepest node dictates
      // height. We collect unique tier values from all branches and spread
      // them out vertically.
    }
    for (const branch of branches) {
      for (const node of branch.nodes) {
        if (!tiers.has(node.tier)) {
          tiers.set(node.tier, y);
          y += 1;
        }
      }
    }
    // Always pin tier 1 at the top
    tiers.set(1, 0);
    // Re-pack tiers in order 1..5
    let row = 1;
    const order = [1, 2, 3, 4, 5];
    for (const t of order) tiers.set(t, t - 1);
    return tiers;
  }, [branches]);

  return (
    <div className="relative overflow-x-auto rounded-lg border-2 border-[var(--gold-3)] bg-[var(--parchment-1)]/40 p-2">
      <svg
        viewBox={`0 0 ${(COL_X.survival ?? 0) + COL_WIDTH + 30} ${
          (rowsByTier.get(5) ?? 0) * ROW_GAP + TOP_PAD + 30
        }`}
        className="block h-auto w-full min-w-[700px]"
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="link-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f6d97c" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#a07c3a" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {branches.map(({ branch, nodes }) => (
          <BranchColumn
            key={branch}
            branch={branch}
            nodes={nodes}
            rowsByTier={rowsByTier}
            level={level}
            alloc={alloc}
            points={points}
            nodePos={(id) => nodePosition(id, rowsByTier)}
          />
        ))}
      </svg>
    </div>
  );
}

function nodePosition(
  id: string,
  rowsByTier: Map<number, number>,
): { x: number; y: number } | null {
  const def = getTalent(id);
  if (!def) return null;
  return {
    x: (COL_X[def.branch] ?? 0) + 16,
    y: TOP_PAD + (rowsByTier.get(def.tier) ?? 0) * ROW_GAP,
  };
}

function BranchColumn({
  branch,
  nodes,
  rowsByTier,
  level,
  alloc,
  points,
  nodePos,
}: {
  branch: TalentBranch;
  nodes: TalentDef[];
  rowsByTier: Map<number, number>;
  level: number;
  alloc: Record<string, number>;
  points: number;
  nodePos: (id: string) => { x: number; y: number } | null;
}) {
  const meta = BRANCH_META[branch];
  const branchPts = pointsInBranch(branch, alloc);
  return (
    <g>
      {/* Branch banner */}
      <rect
        x={(COL_X[branch] ?? 0) - 6}
        y={20}
        width={COL_WIDTH}
        height={66}
        rx={10}
        fill="rgba(58,36,18,0.85)"
        stroke={meta.color}
        strokeWidth={2}
      />
      <text
        x={(COL_X[branch] ?? 0) + COL_WIDTH / 2 - 6}
        y={42}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={15}
        fontWeight="bold"
        fill={meta.accent}
        letterSpacing={3}
      >
        {meta.name.toUpperCase()}
      </text>
      <text
        x={(COL_X[branch] ?? 0) + COL_WIDTH / 2 - 6}
        y={62}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={10}
        fontStyle="italic"
        fill="#a07c3a"
      >
        {branchPts} pts investis
      </text>
      <text
        x={(COL_X[branch] ?? 0) + COL_WIDTH / 2 - 6}
        y={78}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={9}
        fill="#a07c3a"
        opacity={0.85}
      >
        {meta.tagline}
      </text>

      {/* Connector lines (drawn before nodes so nodes overlap them) */}
      {nodes.flatMap((child) =>
        (child.prerequisites.requiresTalentId
          ? [child.prerequisites.requiresTalentId]
          : []
        ).map((parentId) => {
          const a = nodePos(parentId);
          const b = nodePos(child.id);
          if (!a || !b) return null;
          const ax = a.x + NODE_W;
          const ay = a.y + NODE_H / 2;
          const bx = b.x;
          const by = b.y + NODE_H / 2;
          const midX = (ax + bx) / 2;
          const d = `M ${ax} ${ay} C ${midX} ${ay}, ${midX} ${by}, ${bx} ${by}`;
          const parentAllocated = (alloc[parentId] ?? 0) > 0;
          return (
            <path
              key={`link-${branch}-${parentId}-${child.id}`}
              d={d}
              fill="none"
              stroke={parentAllocated ? "url(#link-grad)" : "rgba(120,90,40,0.35)"}
              strokeWidth={parentAllocated ? 2.4 : 1.5}
              strokeDasharray={parentAllocated ? "0" : "5 5"}
            />
          );
        }),
      )}

      {/* Nodes */}
      {nodes.map((n) => (
        <TalentNode
          key={n.id}
          def={n}
          row={(rowsByTier.get(n.tier) ?? 0) * ROW_GAP}
          level={level}
          alloc={alloc}
          points={points}
        />
      ))}
    </g>
  );
}

function TalentNode({
  def,
  row,
  level,
  alloc,
  points,
}: {
  def: TalentDef;
  row: number;
  level: number;
  alloc: Record<string, number>;
  points: number;
}) {
  const meta = BRANCH_META[def.branch];
  const allocated = (alloc[def.id] ?? 0) > 0;
  const { ok, reasons } = isTalentAvailable(def, alloc, level);
  const canAfford = points >= def.cost;
  const canAllocate = !allocated && ok && canAfford;
  const state: "allocated" | "available" | "locked" = allocated
    ? "allocated"
    : ok && canAfford
    ? "available"
    : "locked";

  const x = COL_X[def.branch] ?? 0;
  const y = TOP_PAD + row;
  const allocateTalent = useGame((s) => s.allocateTalent);
  const refundTalent = useGame((s) => s.refundTalent);

  const fill = state === "allocated" ? meta.color : state === "available" ? "#3a2412" : "rgba(40,25,10,0.85)";
  const stroke = state === "allocated" ? meta.accent : ok ? meta.color : "#5a3a1f";

  return (
    <g
      style={{
        cursor: canAllocate ? "pointer" : allocated ? "pointer" : "not-allowed",
      }}
      onClick={() => {
        if (canAllocate) allocateTalent(def.id);
        else if (allocated) refundTalent(def.id);
      }}
    >
      {/* Halo */}
      {state === "available" && (
        <rect
          x={x}
          y={y - 4}
          width={NODE_W + 16}
          height={NODE_H + 8}
          rx={10}
          fill={meta.color}
          opacity={0.14}
        />
      )}
      {/* Card */}
      <rect
        x={x + 8}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={state === "available" ? 2 : 1.5}
      />
      {/* Brass corner accents — only on unlocked nodes, to match the
          parchment aesthetic of the rest of the game. */}
      {state !== "locked" && [0, 1, 2, 3].map((corner) => {
        const cx = x + 8 + (corner % 2 === 0 ? 0 : NODE_W);
        const cy = y + (corner < 2 ? 0 : NODE_H);
        const dx = corner % 2 === 0 ? 1 : -1;
        const dy = corner < 2 ? 1 : -1;
        return (
          <g key={corner}>
            <circle cx={cx + dx * 4} cy={cy + dy * 4} r={2.5} fill={meta.accent} />
          </g>
        );
      })}

      {/* Icon */}
      <text
        x={x + 28}
        y={y + 28}
        textAnchor="middle"
        fontFamily="serif"
        fontSize={22}
        fill={state === "locked" ? "#5a3a1f" : meta.accent}
        opacity={state === "locked" ? 0.6 : 1}
      >
        {def.icon}
      </text>

      {/* Title */}
      <text
        x={x + 50}
        y={y + 22}
        fontFamily="Georgia, serif"
        fontSize={12.5}
        fontWeight="bold"
        fill={state === "locked" ? "#a07c3a" : "#fff4c2"}
        opacity={state === "locked" ? 0.75 : 1}
      >
        {def.nameFr}
      </text>
      <text
        x={x + 50}
        y={y + 38}
        fontFamily="Georgia, serif"
        fontSize={9}
        fontStyle="italic"
        fill={state === "locked" ? "#a07c3a" : meta.accent}
        opacity={state === "locked" ? 0.7 : 0.95}
      >
        {truncate(def.descFr, 38)}
      </text>

      {/* Cost badge */}
      <g>
        <rect
          x={x + 8}
          y={y + NODE_H - 18}
          width={NODE_W - 16}
          height={16}
          rx={6}
          fill="rgba(20,10,2,0.6)"
          stroke={meta.accent}
          strokeOpacity={0.5}
          strokeWidth={1}
        />
        <text
          x={x + 8 + 8}
          y={y + NODE_H - 6}
          fontFamily="Georgia, serif"
          fontSize={10}
          fill={state === "allocated" ? "#a3e635" : "#f6d97c"}
        >
          {state === "allocated"
            ? `✓ ACQUIS`
            : `Coût ${def.cost} pt${def.cost > 1 ? "s" : ""}`}
        </text>
        {def.cost > 1 && state !== "allocated" && (
          <g transform={`translate(${x + 8 + NODE_W - 30}, ${y + NODE_H - 14})`}>
            <Crown className="h-3 w-3" fill={meta.accent} stroke={meta.accent} />
          </g>
        )}
      </g>

      {/* Lock / Check overlay for bookkeeping */}
      {state === "locked" && (
        <g transform={`translate(${x + 8 + NODE_W - 26}, ${y + 6})`}>
          <rect width={20} height={20} rx={4} fill="#3a2412" />
          <text
            x={10}
            y={14}
            textAnchor="middle"
            fontFamily="serif"
            fontSize={12}
            fill="#a07c3a"
          >
            🔒
          </text>
          <title>{reasons.join(" · ") || "Conditions non remplies"}</title>
        </g>
      )}
      {state === "allocated" && (
        <g transform={`translate(${x + 8 + NODE_W - 26}, ${y + 6})`}>
          <rect width={20} height={20} rx={4} fill={meta.color} />
          <text
            x={10}
            y={15}
            textAnchor="middle"
            fontFamily="serif"
            fontSize={14}
            fill="#fff4c2"
          >
            ✓
          </text>
        </g>
      )}
    </g>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

function FooterHint() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-[var(--gold-4)] bg-[rgba(255,245,215,0.35)] px-3 py-2 text-[11px] italic text-[var(--parchment-ink-soft)]">
      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold-3)]" />
      <div className="space-y-0.5">
        <p>
          Cliquez sur un talent <span className="font-bold text-[var(--gold-3)]">vert déblocable</span> pour le dépenser.
        </p>
        <p>
          Cliquez sur un talent <span className="font-bold" style={{ color: "#a3e635" }}>acquis</span> pour le rembourser (utile pour tester des configurations).
        </p>
        <p>
          Les capstones de tier 5 coûtent 2 points. L'ultime de Combat (Bourreau) fait passer les critiques de <code>×2</code> à{" "}
          <code>×2.5</code>.
        </p>
      </div>
    </div>
  );
}
