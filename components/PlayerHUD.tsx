"use client";

import { useGameStore } from "@/store/gameStore";
import { COLOR_HEX } from "@/lib/colors";

export default function PlayerHUD() {
  const { playerHp, playerMaxHp, orbs, floor, maxFloors, score, enemiesDefeated, enemies, lastMessage } =
    useGameStore();

  const hpPct = (playerHp / playerMaxHp) * 100;
  const hpColor = hpPct > 50 ? "#4ade80" : hpPct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3">
      {/* HP Bar */}
      <div className="flex items-center gap-3">
        <span className="text-text-secondary text-sm font-mono w-24">
          HP {playerHp}/{playerMaxHp}
        </span>
        <div className="flex-1 h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, background: hpColor }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-sm text-text-secondary font-mono">
        <span>Floor {floor}/{maxFloors}</span>
        <span>Enemies: {enemies.length} left</span>
        <span>Defeated: {enemiesDefeated}</span>
        <span>Score: {score}</span>
      </div>

      {/* Orb Inventory */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-sm">Orbs:</span>
        <div className="flex gap-1">
          {orbs.map((orb, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-surface-overlay flex items-center justify-center"
              style={{ background: COLOR_HEX[orb] }}
            >
              <span className="text-xs font-bold text-text-inverse">
                {orb[0].toUpperCase()}
              </span>
            </div>
          ))}
          {Array.from({ length: 5 - orbs.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-7 h-7 rounded-full border-2 border-surface-overlay bg-bg-tertiary"
            />
          ))}
        </div>
      </div>

      {/* Message */}
      {lastMessage && (
        <div className="bg-surface-raised rounded px-3 py-2 text-sm text-text-primary font-mono min-h-[40px]">
          {lastMessage}
        </div>
      )}
    </div>
  );
}
