import { PrimaryColor, MixedColor, GameColor, CombatEffect, Enemy } from "./types";
import { CONFIG } from "./config";

export interface MixResult {
  color: MixedColor;
  name: string;
  description: string;
}

const MIX_MAP: Record<string, MixResult> = {
  "red+blue": { color: "purple", name: "Purple Curse", description: "Poison: damage over 3 turns" },
  "blue+red": { color: "purple", name: "Purple Curse", description: "Poison: damage over 3 turns" },
  "red+yellow": { color: "orange", name: "Orange Fire", description: "AoE: damages adjacent enemies" },
  "yellow+red": { color: "orange", name: "Orange Fire", description: "AoE: damages adjacent enemies" },
  "blue+yellow": { color: "green", name: "Green Heal", description: "Restore HP" },
  "yellow+blue": { color: "green", name: "Green Heal", description: "Restore HP" },
};

export function mixColors(a: PrimaryColor, b: PrimaryColor): MixResult | null {
  if (a === b) return null;
  return MIX_MAP[`${a}+${b}`] ?? null;
}

export function getAllMixes(): MixResult[] {
  return [
    MIX_MAP["red+blue"],
    MIX_MAP["red+yellow"],
    MIX_MAP["blue+yellow"],
  ];
}

const WEAKNESS_MAP: Record<string, GameColor> = {
  red_slime: "blue",
  blue_wraith: "yellow",
  yellow_golem: "red",
  purple_demon: "green",
};

const RESISTANCE_MAP: Record<string, GameColor> = {
  red_slime: "red",
  blue_wraith: "blue",
  yellow_golem: "yellow",
  purple_demon: "purple",
};

export function getWeakness(enemyType: string): GameColor {
  return WEAKNESS_MAP[enemyType] ?? "red";
}

export function getResistance(enemyType: string): GameColor {
  return RESISTANCE_MAP[enemyType] ?? "red";
}

export function computeSingleOrbEffect(
  orb: PrimaryColor,
  target: Enemy
): CombatEffect {
  let dmg: number = CONFIG.SINGLE_ORB_DAMAGE;
  if (orb === target.weakness) dmg = Math.floor(dmg * CONFIG.WEAKNESS_MULTIPLIER);
  if (orb === target.resistance) dmg = Math.floor(dmg * CONFIG.RESISTANCE_MULTIPLIER);
  return { type: "damage", amount: dmg, target: target.id };
}

export function computeMixedEffect(
  mix: MixResult,
  target: Enemy,
  adjacentEnemyIds: string[]
): CombatEffect {
  switch (mix.color) {
    case "purple":
      return { type: "poison", turns: CONFIG.POISON_TURNS, target: target.id };
    case "orange":
      return { type: "aoe", amount: CONFIG.AOE_DAMAGE, targets: [target.id, ...adjacentEnemyIds] };
    case "green":
      return { type: "heal", amount: CONFIG.HEAL_AMOUNT };
    default:
      return { type: "damage", amount: CONFIG.MIXED_DAMAGE, target: target.id };
  }
}

export function getMixedDamage(mix: MixResult, target: Enemy): number {
  let dmg: number = CONFIG.MIXED_DAMAGE;
  if (mix.color === target.weakness) dmg = Math.floor(dmg * CONFIG.WEAKNESS_MULTIPLIER);
  if (mix.color === target.resistance) dmg = Math.floor(dmg * CONFIG.RESISTANCE_MULTIPLIER);
  return dmg;
}

export const COLOR_HEX: Record<GameColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
  green: "#22c55e",
  orange: "#f97316",
};

export const COLOR_EMOJI: Record<GameColor, string> = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  purple: "🟣",
  green: "🟢",
  orange: "🟠",
};
