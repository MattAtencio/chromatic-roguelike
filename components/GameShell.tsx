"use client";

import { useEffect, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import DungeonGrid from "./DungeonGrid";
import PlayerHUD from "./PlayerHUD";
import CombatPanel from "./CombatPanel";
import GameOver from "./GameOver";

export default function GameShell() {
  const { phase, start, move } = useGameStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move(1, 0);
          break;
      }
    },
    [phase, move]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (phase === "title") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
            Chromatic Roguelike
          </h1>
          <p className="text-text-secondary max-w-md">
            A dungeon crawler where color mixing IS the combat system.
            Combine Red, Blue, and Yellow orbs to create powerful attacks.
          </p>
        </div>

        <div className="bg-surface-raised rounded-lg p-4 text-sm text-text-secondary max-w-sm space-y-2">
          <p><span className="text-red-500 font-bold">Red</span> + <span className="text-blue-500 font-bold">Blue</span> = <span className="text-purple-500 font-bold">Purple</span> (Poison)</p>
          <p><span className="text-red-500 font-bold">Red</span> + <span className="text-yellow-400 font-bold">Yellow</span> = <span className="text-orange-500 font-bold">Orange</span> (AoE Fire)</p>
          <p><span className="text-blue-500 font-bold">Blue</span> + <span className="text-yellow-400 font-bold">Yellow</span> = <span className="text-green-500 font-bold">Green</span> (Heal)</p>
        </div>

        <button
          onClick={start}
          className="px-8 py-3 rounded-lg bg-accent-primary text-text-inverse font-bold text-lg cursor-pointer hover:brightness-110 transition-all hover:scale-105"
        >
          Start Game
        </button>

        <a href="/help" className="text-text-muted text-sm hover:text-text-secondary transition underline">
          How to Play
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 pt-6 pb-safe">
      <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
        Chromatic Roguelike
      </h1>

      <PlayerHUD />
      <DungeonGrid />
      <CombatPanel />
      <GameOver />

      <div className="text-text-muted text-xs text-center mt-2">
        Move: WASD / Arrow keys / Click adjacent tile
      </div>
    </div>
  );
}
