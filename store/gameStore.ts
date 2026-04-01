import { create } from "zustand";
import { GameState } from "@/lib/types";
import { createInitialState, startGame, movePlayer, performAttack, fleeCombat } from "@/lib/engine";

interface GameStore extends GameState {
  init: () => void;
  start: () => void;
  move: (dx: number, dy: number) => void;
  attack: (orbIndices: number[]) => void;
  flee: () => void;
  restart: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  init: () => set(createInitialState()),

  start: () => set(startGame()),

  move: (dx: number, dy: number) => {
    const state = get();
    const next = movePlayer(state, dx, dy);
    set(next);
  },

  attack: (orbIndices: number[]) => {
    const state = get();
    const next = performAttack(state, orbIndices);
    set(next);
  },

  flee: () => {
    const state = get();
    const next = fleeCombat(state);
    set(next);
  },

  restart: () => set(startGame()),
}));
