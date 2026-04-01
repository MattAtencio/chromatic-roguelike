"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { COLOR_HEX, mixColors } from "@/lib/colors";
import { PrimaryColor } from "@/lib/types";

export default function CombatPanel() {
  const { phase, combatTarget, orbs, attack, flee } = useGameStore();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = useCallback(
    (index: number) => {
      setSelected((prev) => {
        if (prev.includes(index)) return prev.filter((i) => i !== index);
        if (prev.length >= 2) return prev;
        return [...prev, index];
      });
    },
    []
  );

  if (phase !== "combat" || !combatTarget) return null;

  const selectedColors = selected.map((i) => orbs[i]) as PrimaryColor[];
  let mixPreview = "";
  if (selectedColors.length === 2 && selectedColors[0] !== selectedColors[1]) {
    const mix = mixColors(selectedColors[0], selectedColors[1]);
    if (mix) mixPreview = `= ${mix.name} (${mix.description})`;
  } else if (selectedColors.length === 2) {
    mixPreview = `= Double ${selectedColors[0]} (1.5x damage)`;
  }

  const canAttack = selected.length >= 1;

  return (
    <div className="w-full max-w-[420px] mx-auto bg-surface-raised rounded-lg p-4 space-y-3 border border-surface-overlay">
      <div className="text-center text-sm text-text-secondary">
        Combat vs{" "}
        <span className="font-bold" style={{ color: COLOR_HEX[combatTarget.color] }}>
          {combatTarget.type.replace("_", " ")}
        </span>
        <span className="ml-2">
          (HP: {combatTarget.hp}/{combatTarget.maxHp})
        </span>
      </div>

      <div className="text-xs text-text-muted text-center">
        Weak to: <span className="text-accent-success">{combatTarget.weakness}</span> | Resists:{" "}
        <span className="text-accent-error">{combatTarget.resistance}</span>
      </div>

      <div className="text-center text-text-secondary text-sm">Select 1-2 orbs:</div>

      <div className="flex justify-center gap-2">
        {orbs.map((orb, i) => {
          const isSelected = selected.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-10 h-10 rounded-full border-3 flex items-center justify-center transition-transform cursor-pointer ${
                isSelected ? "scale-110 border-accent-primary" : "border-surface-overlay hover:border-text-muted"
              }`}
              style={{ background: COLOR_HEX[orb] }}
            >
              <span className="text-sm font-bold text-text-inverse">
                {orb[0].toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {mixPreview && (
        <div className="text-center text-sm text-accent-primary font-mono">{mixPreview}</div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            if (canAttack) {
              attack(selected);
              setSelected([]);
            }
          }}
          disabled={!canAttack}
          className="px-5 py-2 rounded bg-accent-primary text-text-inverse font-bold text-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          Attack
        </button>
        <button
          onClick={() => {
            flee();
            setSelected([]);
          }}
          className="px-5 py-2 rounded bg-surface-overlay text-text-secondary text-sm cursor-pointer hover:bg-surface-default transition"
        >
          Flee
        </button>
      </div>
    </div>
  );
}
