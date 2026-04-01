export type PrimaryColor = "red" | "blue" | "yellow";
export type MixedColor = "purple" | "green" | "orange";
export type GameColor = PrimaryColor | MixedColor;

export interface Position {
  x: number;
  y: number;
}

export type TileType = "floor" | "wall" | "stairs";

export interface Tile {
  type: TileType;
  position: Position;
}

export type EnemyType = "red_slime" | "blue_wraith" | "yellow_golem" | "purple_demon";

export interface Enemy {
  id: string;
  type: EnemyType;
  position: Position;
  hp: number;
  maxHp: number;
  damage: number;
  color: PrimaryColor | MixedColor;
  weakness: GameColor;
  resistance: GameColor;
  poisonTurns: number;
}

export interface OrbPickup {
  id: string;
  position: Position;
  color: PrimaryColor;
}

export type CombatEffect =
  | { type: "damage"; amount: number; target: string }
  | { type: "poison"; turns: number; target: string }
  | { type: "aoe"; amount: number; targets: string[] }
  | { type: "heal"; amount: number };

export interface GameState {
  phase: "title" | "playing" | "combat" | "gameover" | "win";
  floor: number;
  maxFloors: number;
  playerPosition: Position;
  playerHp: number;
  playerMaxHp: number;
  orbs: PrimaryColor[];
  maxOrbs: number;
  tiles: Tile[][];
  enemies: Enemy[];
  orbPickups: OrbPickup[];
  score: number;
  enemiesDefeated: number;
  turnCount: number;
  combatTarget: Enemy | null;
  lastMessage: string;
  gridSize: number;
}

export interface HighScore {
  score: number;
  floor: number;
  enemies: number;
  date: string;
  won: boolean;
}
