"use client";

import { Position, Tile as TileType, Enemy, OrbPickup } from "@/lib/types";
import { COLOR_HEX } from "@/lib/colors";

interface TileProps {
  tile: TileType;
  isPlayer: boolean;
  enemy: Enemy | null;
  orb: OrbPickup | null;
  onClick: (pos: Position) => void;
}

export default function Tile({ tile, isPlayer, enemy, orb, onClick }: TileProps) {
  const pos = tile.position;

  let bg = "bg-surface-default";
  let content: React.ReactNode = null;
  let border = "border border-bg-tertiary";

  if (tile.type === "wall") {
    bg = "bg-bg-tertiary";
    content = <span className="text-text-muted text-xs">#</span>;
  } else if (tile.type === "stairs") {
    bg = "bg-surface-default";
    content = <span className="text-accent-warning text-lg font-bold">&#x25BC;</span>;
  }

  if (isPlayer) {
    content = <span className="text-xl">@</span>;
    border = "border-2 border-accent-primary";
  } else if (enemy) {
    const color = COLOR_HEX[enemy.color];
    content = (
      <div className="flex flex-col items-center leading-none">
        <span className="text-base font-bold" style={{ color }}>
          {enemy.type === "purple_demon" ? "D" : enemy.type[0].toUpperCase()}
        </span>
        <div
          className="w-full h-0.5 mt-0.5 rounded"
          style={{
            background: `linear-gradient(to right, ${color} ${(enemy.hp / enemy.maxHp) * 100}%, #333 0%)`,
          }}
        />
      </div>
    );
  } else if (orb) {
    const color = COLOR_HEX[orb.color];
    content = (
      <span className="text-base" style={{ color }}>&#x25CF;</span>
    );
  }

  return (
    <button
      className={`${bg} ${border} w-full aspect-square flex items-center justify-center rounded-sm transition-colors hover:bg-surface-raised cursor-pointer`}
      onClick={() => onClick(pos)}
      aria-label={`Tile ${pos.x},${pos.y}`}
    >
      {content}
    </button>
  );
}
