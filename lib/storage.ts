import { HighScore } from "./types";

const STORAGE_KEY = "chromatic-roguelike-scores";

export function getHighScores(): HighScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HighScore[];
  } catch {
    return [];
  }
}

export function saveHighScore(entry: HighScore): HighScore[] {
  const scores = getHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const top10 = scores.slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  } catch {
    // ignore storage errors
  }
  return top10;
}
