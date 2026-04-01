"use client";

import { useGameStore } from "@/store/gameStore";
import Tile from "./Tile";
import { Position } from "@/lib/types";

export default function DungeonGrid() {
  const {
    tiles,
    playerPosition,
    enemies,
    orbPickups,
    gridSize,
    move,
    phase,
  } = useGameStore();

  function handleTileClick(pos: Position) {
    if (phase !== "playing") return;
    const dx = pos.x - playerPosition.x;
    const dy = pos.y - playerPosition.y;
    // Only allow adjacent moves (cardinal)
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      move(dx, dy);
    }
  }

  return (
    <div
      className="grid gap-0.5 w-full max-w-[420px] mx-auto"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {tiles.map((row, y) =>
        row.map((tile, x) => {
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const enemy = enemies.find((e) => e.position.x === x && e.position.y === y) ?? null;
          const orb = orbPickups.find((o) => o.position.x === x && o.position.y === y) ?? null;

          return (
            <Tile
              key={`${x}-${y}`}
              tile={tile}
              isPlayer={isPlayer}
              enemy={enemy}
              orb={orb}
              onClick={handleTileClick}
            />
          );
        })
      )}
    </div>
  );
}
