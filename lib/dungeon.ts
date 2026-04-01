import {
  Tile,
  Enemy,
  OrbPickup,
  Position,
  EnemyType,
  PrimaryColor,
} from "./types";
import { CONFIG } from "./config";
import { getWeakness, getResistance } from "./colors";

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomFloorPositions(
  tiles: Tile[][],
  exclude: Position[],
  count: number,
  size: number
): Position[] {
  const candidates: Position[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (
        tiles[y][x].type === "floor" &&
        !exclude.some((p) => p.x === x && p.y === y)
      ) {
        candidates.push({ x, y });
      }
    }
  }
  return shuffle(candidates).slice(0, count);
}

const ENEMY_TYPES: EnemyType[] = [
  "red_slime",
  "blue_wraith",
  "yellow_golem",
  "purple_demon",
];

const ENEMY_COLORS: Record<EnemyType, PrimaryColor | "purple"> = {
  red_slime: "red",
  blue_wraith: "blue",
  yellow_golem: "yellow",
  purple_demon: "purple",
};

export function generateFloor(
  floor: number,
  size: number
): {
  tiles: Tile[][];
  enemies: Enemy[];
  orbPickups: OrbPickup[];
  playerStart: Position;
  stairsPosition: Position;
} {
  // Init all floor tiles
  const tiles: Tile[][] = [];
  for (let y = 0; y < size; y++) {
    tiles[y] = [];
    for (let x = 0; x < size; x++) {
      tiles[y][x] = { type: "floor", position: { x, y } };
    }
  }

  // Place walls (not on edges where player/stairs could be)
  const wallCount = CONFIG.WALL_COUNT_BASE + CONFIG.WALL_COUNT_PER_FLOOR * (floor - 1);
  const wallCandidates: Position[] = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      wallCandidates.push({ x, y });
    }
  }
  const wallPositions = shuffle(wallCandidates).slice(0, Math.min(wallCount, wallCandidates.length));
  for (const pos of wallPositions) {
    tiles[pos.y][pos.x] = { type: "wall", position: pos };
  }

  // Player starts bottom-left, stairs top-right
  const playerStart: Position = { x: 0, y: size - 1 };
  const stairsPosition: Position = { x: size - 1, y: 0 };

  // Make sure player start and stairs are floor
  tiles[playerStart.y][playerStart.x] = { type: "floor", position: playerStart };
  tiles[stairsPosition.y][stairsPosition.x] = { type: "stairs", position: stairsPosition };

  const reserved = [playerStart, stairsPosition];

  // Place enemies
  const isBossFloor = floor === CONFIG.MAX_FLOORS;
  const enemyCount = isBossFloor
    ? 1
    : CONFIG.ENEMIES_PER_FLOOR + CONFIG.ENEMIES_EXTRA_PER_FLOOR * (floor - 1);
  const enemyPositions = randomFloorPositions(tiles, reserved, enemyCount, size);

  const enemies: Enemy[] = enemyPositions.map((pos, i) => {
    const type = isBossFloor ? "purple_demon" : ENEMY_TYPES[i % ENEMY_TYPES.length];
    const baseHp = CONFIG.ENEMY_BASE_HP + CONFIG.ENEMY_HP_PER_FLOOR * (floor - 1);
    const baseDmg = CONFIG.ENEMY_BASE_DAMAGE + CONFIG.ENEMY_DAMAGE_PER_FLOOR * (floor - 1);
    const hp = isBossFloor ? baseHp * CONFIG.BOSS_HP_MULTIPLIER : baseHp;
    const damage = isBossFloor ? baseDmg * CONFIG.BOSS_DAMAGE_MULTIPLIER : baseDmg;

    return {
      id: nextId("enemy"),
      type,
      position: pos,
      hp,
      maxHp: hp,
      damage,
      color: ENEMY_COLORS[type],
      weakness: getWeakness(type),
      resistance: getResistance(type),
      poisonTurns: 0,
    };
  });

  // Place orb pickups
  const orbCount = CONFIG.ORBS_PER_FLOOR + CONFIG.ORBS_EXTRA_PER_FLOOR * (floor - 1);
  const usedPositions = [...reserved, ...enemyPositions];
  const orbPositions = randomFloorPositions(tiles, usedPositions, orbCount, size);
  const primaryColors: PrimaryColor[] = ["red", "blue", "yellow"];
  const orbPickups: OrbPickup[] = orbPositions.map((pos, i) => ({
    id: nextId("orb"),
    position: pos,
    color: primaryColors[i % 3],
  }));

  return { tiles, enemies, orbPickups, playerStart, stairsPosition };
}
