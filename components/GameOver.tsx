"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { saveHighScore, getHighScores } from "@/lib/storage";
import { HighScore } from "@/lib/types";

export default function GameOver() {
  const { phase, score, floor, enemiesDefeated, restart } = useGameStore();
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    if (phase === "gameover" || phase === "win") {
      const scores = saveHighScore({
        score,
        floor,
        enemies: enemiesDefeated,
        date: new Date().toLocaleDateString(),
        won: phase === "win",
      });
      setHighScores(scores);
    }
  }, [phase, score, floor, enemiesDefeated]);

  if (phase !== "gameover" && phase !== "win") return null;

  const isWin = phase === "win";

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-raised rounded-lg p-6 space-y-4 border border-surface-overlay text-center">
      <h2
        className={`text-2xl font-bold ${
          isWin ? "text-accent-success" : "text-accent-error"
        }`}
      >
        {isWin ? "Victory!" : "Game Over"}
      </h2>

      <div className="space-y-1 text-text-secondary text-sm">
        <p>Score: <span className="text-text-primary font-bold">{score}</span></p>
        <p>Floor reached: <span className="text-text-primary font-bold">{floor}</span></p>
        <p>Enemies defeated: <span className="text-text-primary font-bold">{enemiesDefeated}</span></p>
      </div>

      {highScores.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-text-muted uppercase tracking-wide">High Scores</h3>
          <div className="space-y-1">
            {highScores.slice(0, 5).map((hs, i) => (
              <div
                key={i}
                className="flex justify-between text-xs font-mono px-2 py-1 bg-bg-tertiary rounded"
              >
                <span className="text-text-secondary">
                  #{i + 1} {hs.won ? "W" : "L"} F{hs.floor}
                </span>
                <span className="text-text-primary">{hs.score}</span>
                <span className="text-text-muted">{hs.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={restart}
        className="px-6 py-2 rounded bg-accent-primary text-text-inverse font-bold cursor-pointer hover:brightness-110 transition"
      >
        Play Again
      </button>
    </div>
  );
}
