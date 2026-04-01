import {
  GameState,
  Position,
  PrimaryColor,
  Enemy,
} from "./types";
import { CONFIG } from "./config";
import { generateFloor } from "./dungeon";
import {
  mixColors,
  computeSingleOrbEffect,
  computeMixedEffect,
  getMixedDamage,
} from "./colors";

export function createInitialState(): GameState {
  const floor = 1;
  const size = CONFIG.GRID_SIZE;
  const { tiles, enemies, orbPickups, playerStart } = generateFloor(floor, size);

  return {
    phase: "title",
    floor,
    maxFloors: CONFIG.MAX_FLOORS,
    playerPosition: playerStart,
    playerHp: CONFIG.PLAYER_MAX_HP,
    playerMaxHp: CONFIG.PLAYER_MAX_HP,
    orbs: ["red", "blue", "yellow"],
    maxOrbs: CONFIG.MAX_ORBS,
    tiles,
    enemies,
    orbPickups,
    score: 0,
    enemiesDefeated: 0,
    turnCount: 0,
    combatTarget: null,
    lastMessage: "Welcome to the Chromatic Dungeon!",
    gridSize: size,
  };
}

export function startGame(): GameState {
  const state = createInitialState();
  state.phase = "playing";
  state.lastMessage = "Floor 1 — Find and defeat enemies to unlock the stairs!";
  return state;
}

function posEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

export function movePlayer(
  state: GameState,
  dx: number,
  dy: number
): GameState {
  if (state.phase !== "playing") return state;

  const nx = state.playerPosition.x + dx;
  const ny = state.playerPosition.y + dy;

  // Bounds check
  if (nx < 0 || nx >= state.gridSize || ny < 0 || ny >= state.gridSize) {
    return { ...state, lastMessage: "You can't move there." };
  }

  const tile = state.tiles[ny][nx];

  // Wall check
  if (tile.type === "wall") {
    return { ...state, lastMessage: "A wall blocks your path." };
  }

  // Enemy check — enter combat
  const enemyAtTile = state.enemies.find((e) => posEqual(e.position, { x: nx, y: ny }));
  if (enemyAtTile) {
    return {
      ...state,
      phase: "combat",
      combatTarget: enemyAtTile,
      lastMessage: `A ${enemyAtTile.type.replace("_", " ")} blocks the way! Choose orbs to attack.`,
    };
  }

  // Stairs check
  if (tile.type === "stairs") {
    if (state.enemies.length > 0) {
      return { ...state, lastMessage: "Defeat all enemies before descending!" };
    }
    return advanceFloor(state);
  }

  // Move
  let next: GameState = {
    ...state,
    playerPosition: { x: nx, y: ny },
    turnCount: state.turnCount + 1,
    lastMessage: "",
  };

  // Pick up orb
  const orbIndex = next.orbPickups.findIndex((o) => posEqual(o.position, { x: nx, y: ny }));
  if (orbIndex >= 0) {
    const orb = next.orbPickups[orbIndex];
    if (next.orbs.length < next.maxOrbs) {
      next = {
        ...next,
        orbs: [...next.orbs, orb.color],
        orbPickups: next.orbPickups.filter((_, i) => i !== orbIndex),
        lastMessage: `Picked up a ${orb.color} orb!`,
      };
    } else {
      next = { ...next, lastMessage: "Inventory full! Can't pick up orb." };
    }
  }

  // Check adjacent enemies for auto-combat prompt
  const adjacentEnemy = next.enemies.find((e) => isAdjacent(next.playerPosition, e.position));
  if (adjacentEnemy && !next.lastMessage) {
    next = { ...next, lastMessage: `A ${adjacentEnemy.type.replace("_", " ")} is adjacent. Move into it to fight!` };
  }

  // Enemy turn
  next = enemyTurn(next);

  return next;
}

function advanceFloor(state: GameState): GameState {
  const nextFloor = state.floor + 1;

  if (nextFloor > CONFIG.MAX_FLOORS) {
    // Win!
    return {
      ...state,
      phase: "win",
      score: state.score + CONFIG.SCORE_PER_FLOOR + CONFIG.SCORE_EFFICIENCY_BONUS * Math.max(0, 100 - state.turnCount),
      lastMessage: "You conquered the Chromatic Dungeon!",
    };
  }

  const { tiles, enemies, orbPickups, playerStart } = generateFloor(nextFloor, state.gridSize);

  return {
    ...state,
    floor: nextFloor,
    tiles,
    enemies,
    orbPickups,
    playerPosition: playerStart,
    score: state.score + CONFIG.SCORE_PER_FLOOR,
    lastMessage: `Floor ${nextFloor}${nextFloor === CONFIG.MAX_FLOORS ? " — BOSS FLOOR!" : ""}`,
  };
}

export function performAttack(
  state: GameState,
  selectedOrbs: number[]
): GameState {
  if (state.phase !== "combat" || !state.combatTarget) return state;

  const target = state.enemies.find((e) => e.id === state.combatTarget!.id);
  if (!target) return { ...state, phase: "playing", combatTarget: null };

  // Remove used orbs from inventory
  const newOrbs = [...state.orbs];
  // Sort indices descending so removal doesn't shift
  const sorted = [...selectedOrbs].sort((a, b) => b - a);
  for (const idx of sorted) {
    newOrbs.splice(idx, 1);
  }

  const orbColors = selectedOrbs.map((i) => state.orbs[i]) as PrimaryColor[];
  let message = "";
  let enemies = [...state.enemies];
  let playerHp = state.playerHp;
  let score = state.score;
  let enemiesDefeated = state.enemiesDefeated;

  const targetIdx = enemies.findIndex((e) => e.id === target.id);

  if (orbColors.length === 2 && orbColors[0] !== orbColors[1]) {
    // Mixed attack
    const mix = mixColors(orbColors[0], orbColors[1]);
    if (mix) {
      const adjacentEnemyIds = enemies
        .filter((e) => e.id !== target.id && isAdjacent(e.position, target.position))
        .map((e) => e.id);

      const effect = computeMixedEffect(mix, target, adjacentEnemyIds);

      switch (effect.type) {
        case "poison": {
          enemies = enemies.map((e) =>
            e.id === target.id ? { ...e, poisonTurns: effect.turns } : e
          );
          // Also deal base mixed damage
          const dmg = getMixedDamage(mix, target);
          enemies = enemies.map((e) =>
            e.id === target.id ? { ...e, hp: e.hp - dmg } : e
          );
          message = `${mix.name}! ${dmg} damage + poisoned for ${effect.turns} turns!`;
          break;
        }
        case "aoe": {
          const dmg = effect.amount;
          enemies = enemies.map((e) =>
            effect.targets.includes(e.id) ? { ...e, hp: e.hp - dmg } : e
          );
          message = `${mix.name}! ${dmg} AoE damage to ${effect.targets.length} enemies!`;
          break;
        }
        case "heal": {
          playerHp = Math.min(state.playerMaxHp, playerHp + effect.amount);
          message = `${mix.name}! Restored ${effect.amount} HP!`;
          break;
        }
      }
    }
  } else if (orbColors.length >= 1) {
    // Single orb or double same-color
    const orb = orbColors[0];
    const effect = computeSingleOrbEffect(orb, target);
    if (effect.type === "damage") {
      const dmg = orbColors.length === 2 ? Math.floor(effect.amount * 1.5) : effect.amount;
      enemies = enemies.map((e) =>
        e.id === target.id ? { ...e, hp: e.hp - dmg } : e
      );
      message = `${orb} orb attack! ${dmg} damage!`;
    }
  }

  // Remove dead enemies
  const deadEnemies = enemies.filter((e) => e.hp <= 0);
  enemiesDefeated += deadEnemies.length;
  score += deadEnemies.length * CONFIG.SCORE_PER_ENEMY;
  enemies = enemies.filter((e) => e.hp > 0);

  if (deadEnemies.some((e) => e.id === target.id)) {
    message += ` Enemy defeated!`;
    if (enemies.length === 0) {
      message += " Stairs unlocked!";
    }
  }

  let next: GameState = {
    ...state,
    orbs: newOrbs,
    enemies,
    playerHp,
    score,
    enemiesDefeated,
    phase: "playing",
    combatTarget: null,
    lastMessage: message,
    turnCount: state.turnCount + 1,
  };

  // Enemy turn after attack
  next = enemyTurn(next);

  return next;
}

export function fleeCombat(state: GameState): GameState {
  if (state.phase !== "combat") return state;
  return {
    ...state,
    phase: "playing",
    combatTarget: null,
    lastMessage: "You stepped back from combat.",
  };
}

function enemyTurn(state: GameState): GameState {
  let { enemies, playerHp, lastMessage } = state;
  let totalDamage = 0;

  // Process poison
  enemies = enemies.map((e) => {
    if (e.poisonTurns > 0) {
      return {
        ...e,
        hp: e.hp - CONFIG.POISON_DAMAGE_PER_TURN,
        poisonTurns: e.poisonTurns - 1,
      };
    }
    return e;
  });

  // Remove poison-killed enemies
  const poisonKilled = enemies.filter((e) => e.hp <= 0);
  if (poisonKilled.length > 0) {
    lastMessage += ` Poison killed ${poisonKilled.length} enemy(s)!`;
  }
  enemies = enemies.filter((e) => e.hp > 0);

  // Enemies move toward player or attack if adjacent
  enemies = enemies.map((e) => {
    if (isAdjacent(e.position, state.playerPosition)) {
      // Attack player
      totalDamage += e.damage;
      return e;
    }

    // Simple chase: move one step toward player
    const dx = Math.sign(state.playerPosition.x - e.position.x);
    const dy = Math.sign(state.playerPosition.y - e.position.y);

    // Try horizontal first, then vertical
    const candidates = [
      { x: e.position.x + dx, y: e.position.y },
      { x: e.position.x, y: e.position.y + dy },
    ].filter((p) => {
      if (p.x < 0 || p.x >= state.gridSize || p.y < 0 || p.y >= state.gridSize) return false;
      if (state.tiles[p.y][p.x].type === "wall") return false;
      if (posEqual(p as Position, state.playerPosition)) return false;
      if (enemies.some((other) => other.id !== e.id && posEqual(other.position, p as Position))) return false;
      return true;
    });

    if (candidates.length > 0) {
      return { ...e, position: { x: candidates[0].x, y: candidates[0].y } };
    }
    return e;
  });

  if (totalDamage > 0) {
    playerHp -= totalDamage;
    lastMessage += ` Enemies deal ${totalDamage} damage!`;
  }

  if (playerHp <= 0) {
    return {
      ...state,
      enemies,
      playerHp: 0,
      lastMessage: "You have been defeated...",
      phase: "gameover",
    };
  }

  return {
    ...state,
    enemies,
    playerHp,
    lastMessage,
    enemiesDefeated: state.enemiesDefeated + poisonKilled.length,
    score: state.score + poisonKilled.length * CONFIG.SCORE_PER_ENEMY,
  };
}
