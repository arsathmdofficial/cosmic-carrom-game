import { Coin, Striker, Pocket, ShotPrediction, TrajectoryPoint, CoinType } from '../types/carrom';
import { soundManager } from '../audio/soundEffects';

export const BOARD_SIZE = 800;
export const CUSHION_WIDTH = 42;
export const PLAY_AREA_MIN = CUSHION_WIDTH;
export const PLAY_AREA_MAX = BOARD_SIZE - CUSHION_WIDTH;

export const COIN_RADIUS = 15;
export const STRIKER_RADIUS = 21.5;
export const POCKET_RADIUS = 30;
export const POCKET_PULL_RADIUS = 46;

export const BASELINE_OFFSET = 140; // Distance from cushion
export const BASELINE_P1_Y = BOARD_SIZE - BASELINE_OFFSET; // 660
export const BASELINE_P2_Y = BASELINE_OFFSET; // 140
export const BASELINE_MIN_X = 200;
export const BASELINE_MAX_X = 600;

export const POCKETS: Pocket[] = [
  { id: 0, x: 58, y: 58, radius: POCKET_RADIUS, pullRadius: POCKET_PULL_RADIUS },
  { id: 1, x: 742, y: 58, radius: POCKET_RADIUS, pullRadius: POCKET_PULL_RADIUS },
  { id: 2, x: 58, y: 742, radius: POCKET_RADIUS, pullRadius: POCKET_PULL_RADIUS },
  { id: 3, x: 742, y: 742, radius: POCKET_RADIUS, pullRadius: POCKET_PULL_RADIUS },
];

/**
 * Initializes the 19 carrom coins in standard tournament rosette formation:
 * 1 Red Queen (center)
 * 9 White coins (20 pts)
 * 9 Black coins (10 pts)
 */
export function initializeCoins(): Coin[] {
  const coins: Coin[] = [];
  const centerX = BOARD_SIZE / 2;
  const centerY = BOARD_SIZE / 2;
  const d = COIN_RADIUS * 2;

  // 1. Red Queen at exact center (50 pts)
  coins.push({
    id: 'queen-red',
    type: 'red',
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    radius: COIN_RADIUS,
    mass: 1.0,
    points: 50,
    isPocketed: false,
    pocketScale: 1.0,
  });

  // 2. Inner ring: 6 coins alternating White (20) & Black (10)
  // Distance from center = d
  const innerTypes: CoinType[] = ['white', 'black', 'white', 'black', 'white', 'black'];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const type = innerTypes[i];
    coins.push({
      id: `coin-inner-${i}-${type}`,
      type,
      x: centerX + Math.cos(angle) * (d + 0.5),
      y: centerY + Math.sin(angle) * (d + 0.5),
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      mass: 1.0,
      points: type === 'white' ? 20 : 10,
      isPocketed: false,
      pocketScale: 1.0,
    });
  }

  // 3. Outer ring: 12 coins alternating to make 9 whites and 9 blacks total
  // (Inner ring already has 3 whites, 3 blacks. Outer ring needs 6 whites, 6 blacks).
  const outerTypes: CoinType[] = [
    'black', 'white', 'black', 'white',
    'black', 'white', 'black', 'white',
    'black', 'white', 'black', 'white'
  ];
  const r2 = d * Math.sqrt(3); // Tangent radius for outer rosette
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 + Math.PI / 12;
    const type = outerTypes[i];
    coins.push({
      id: `coin-outer-${i}-${type}`,
      type,
      x: centerX + Math.cos(angle) * (r2 + 0.8),
      y: centerY + Math.sin(angle) * (r2 + 0.8),
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      mass: 1.0,
      points: type === 'white' ? 20 : 10,
      isPocketed: false,
      pocketScale: 1.0,
    });
  }

  return coins;
}

/**
 * Creates initial striker for bottom player or top player
 */
export function createStriker(isBottomPlayer: boolean = true): Striker {
  const y = isBottomPlayer ? BASELINE_P1_Y : BASELINE_P2_Y;
  const initialAngle = isBottomPlayer ? -Math.PI / 2 : Math.PI / 2;
  return {
    x: BOARD_SIZE / 2,
    y,
    vx: 0,
    vy: 0,
    radius: STRIKER_RADIUS,
    mass: 3.2, // heavier for authentic carrom momentum
    isPlaced: true,
    isMoving: false,
    baselineY: y,
    baselineMinX: BASELINE_MIN_X,
    baselineMaxX: BASELINE_MAX_X,
    angle: initialAngle,
    power: 0.5,
    isPocketed: false,
    pocketScale: 1.0,
  };
}

export interface PhysicsStepResult {
  pocketedCoins: Coin[];
  strikerPocketed: boolean;
  hasMotion: boolean;
}

/**
 * Advances physics by dt using 8 substeps for collision accuracy and stability
 */
export function stepPhysics(
  coins: Coin[],
  striker: Striker,
  dt: number = 1 / 60
): PhysicsStepResult {
  const substeps = 8;
  const subDt = dt / substeps;
  const friction = Math.pow(0.982, 1 / substeps); // smooth deceleration
  const restitution = 0.92; // coin-coin bounciness
  const wallRestitution = 0.86;

  const result: PhysicsStepResult = {
    pocketedCoins: [],
    strikerPocketed: false,
    hasMotion: false,
  };

  for (let s = 0; s < substeps; s++) {
    // 1. Move striker if in play
    if (striker.isMoving && !striker.isPocketed) {
      striker.x += striker.vx * subDt;
      striker.y += striker.vy * subDt;
      striker.vx *= friction;
      striker.vy *= friction;

      if (Math.hypot(striker.vx, striker.vy) < 1.2) {
        striker.vx = 0;
        striker.vy = 0;
      }
    }

    // 2. Move coins
    for (const coin of coins) {
      if (coin.isPocketed) continue;

      coin.x += coin.vx * subDt;
      coin.y += coin.vy * subDt;
      coin.vx *= friction;
      coin.vy *= friction;

      if (Math.hypot(coin.vx, coin.vy) < 1.0) {
        coin.vx = 0;
        coin.vy = 0;
      }
    }

    // 3. Wall collisions (Striker)
    if (striker.isMoving && !striker.isPocketed) {
      const r = striker.radius;
      let bounced = false;
      let maxSpeed = 0;

      if (striker.x - r < PLAY_AREA_MIN) {
        striker.x = PLAY_AREA_MIN + r;
        striker.vx = -striker.vx * wallRestitution;
        bounced = true;
        maxSpeed = Math.abs(striker.vx);
      } else if (striker.x + r > PLAY_AREA_MAX) {
        striker.x = PLAY_AREA_MAX - r;
        striker.vx = -striker.vx * wallRestitution;
        bounced = true;
        maxSpeed = Math.abs(striker.vx);
      }

      if (striker.y - r < PLAY_AREA_MIN) {
        striker.y = PLAY_AREA_MIN + r;
        striker.vy = -striker.vy * wallRestitution;
        bounced = true;
        maxSpeed = Math.max(maxSpeed, Math.abs(striker.vy));
      } else if (striker.y + r > PLAY_AREA_MAX) {
        striker.y = PLAY_AREA_MAX - r;
        striker.vy = -striker.vy * wallRestitution;
        bounced = true;
        maxSpeed = Math.max(maxSpeed, Math.abs(striker.vy));
      }

      if (bounced && s === 0 && maxSpeed > 20) {
        soundManager.playCushionBounce(Math.min(1.0, maxSpeed / 300));
      }
    }

    // 4. Wall collisions (Coins)
    for (const coin of coins) {
      if (coin.isPocketed) continue;
      const r = coin.radius;
      let bounced = false;
      let speed = 0;

      if (coin.x - r < PLAY_AREA_MIN) {
        coin.x = PLAY_AREA_MIN + r;
        coin.vx = -coin.vx * wallRestitution;
        bounced = true;
        speed = Math.abs(coin.vx);
      } else if (coin.x + r > PLAY_AREA_MAX) {
        coin.x = PLAY_AREA_MAX - r;
        coin.vx = -coin.vx * wallRestitution;
        bounced = true;
        speed = Math.abs(coin.vx);
      }

      if (coin.y - r < PLAY_AREA_MIN) {
        coin.y = PLAY_AREA_MIN + r;
        coin.vy = -coin.vy * wallRestitution;
        bounced = true;
        speed = Math.max(speed, Math.abs(coin.vy));
      } else if (coin.y + r > PLAY_AREA_MAX) {
        coin.y = PLAY_AREA_MAX - r;
        coin.vy = -coin.vy * wallRestitution;
        bounced = true;
        speed = Math.max(speed, Math.abs(coin.vy));
      }

      if (bounced && s === 0 && speed > 25) {
        soundManager.playCushionBounce(Math.min(0.8, speed / 350));
      }
    }

    // 5. Striker-Coin collisions
    if (striker.isMoving && !striker.isPocketed) {
      for (const coin of coins) {
        if (coin.isPocketed) continue;

        const dx = coin.x - striker.x;
        const dy = coin.y - striker.y;
        const dist = Math.hypot(dx, dy);
        const minDist = striker.radius + coin.radius;

        if (dist > 0 && dist < minDist) {
          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart to prevent overlap
          const overlap = minDist - dist;
          striker.x -= nx * overlap * 0.35;
          striker.y -= ny * overlap * 0.35;
          coin.x += nx * overlap * 0.65;
          coin.y += ny * overlap * 0.65;

          // Relative velocity
          const rvx = striker.vx - coin.vx;
          const rvy = striker.vy - coin.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal > 0) {
            const impulse =
              (-(1 + restitution) * velAlongNormal) /
              (1 / striker.mass + 1 / coin.mass);

            striker.vx += (impulse / striker.mass) * nx;
            striker.vy += (impulse / striker.mass) * ny;
            coin.vx -= (impulse / coin.mass) * nx;
            coin.vy -= (impulse / coin.mass) * ny;

            if (s === 0) {
              soundManager.playCollisionSound(Math.min(1.0, Math.abs(velAlongNormal) / 350));
            }
          }
        }
      }
    }

    // 6. Coin-Coin collisions
    for (let i = 0; i < coins.length; i++) {
      const c1 = coins[i];
      if (c1.isPocketed) continue;

      for (let j = i + 1; j < coins.length; j++) {
        const c2 = coins[j];
        if (c2.isPocketed) continue;

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.radius + c2.radius;

        if (dist > 0 && dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;

          const overlap = (minDist - dist) * 0.5;
          c1.x -= nx * overlap;
          c1.y -= ny * overlap;
          c2.x += nx * overlap;
          c2.y += ny * overlap;

          const rvx = c1.vx - c2.vx;
          const rvy = c1.vy - c2.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal > 0) {
            const impulse =
              (-(1 + restitution) * velAlongNormal) / (1 / c1.mass + 1 / c2.mass);

            c1.vx += (impulse / c1.mass) * nx;
            c1.vy += (impulse / c1.mass) * ny;
            c2.vx -= (impulse / c2.mass) * nx;
            c2.vy -= (impulse / c2.mass) * ny;

            if (s === 0) {
              soundManager.playCollisionSound(Math.min(0.9, Math.abs(velAlongNormal) / 300));
            }
          }
        }
      }
    }

    // 7. Pocket Gravitational Suction & Pocketing
    // For striker:
    if (striker.isMoving && !striker.isPocketed) {
      for (const pocket of POCKETS) {
        const dx = pocket.x - striker.x;
        const dy = pocket.y - striker.y;
        const dist = Math.hypot(dx, dy);

        if (dist < pocket.pullRadius) {
          // Gravitational pull toward pocket
          const pull = (1 - dist / pocket.pullRadius) * 220;
          striker.vx += (dx / (dist || 1)) * pull * subDt;
          striker.vy += (dy / (dist || 1)) * pull * subDt;

          if (dist < pocket.radius * 0.85) {
            striker.isPocketed = true;
            striker.vx = 0;
            striker.vy = 0;
            result.strikerPocketed = true;
            soundManager.playFoulSound();
            break;
          }
        }
      }
    }

    // For coins:
    for (const coin of coins) {
      if (coin.isPocketed) continue;

      for (const pocket of POCKETS) {
        const dx = pocket.x - coin.x;
        const dy = pocket.y - coin.y;
        const dist = Math.hypot(dx, dy);

        if (dist < pocket.pullRadius) {
          // Suction
          const pull = (1 - dist / pocket.pullRadius) * 280;
          coin.vx += (dx / (dist || 1)) * pull * subDt;
          coin.vy += (dy / (dist || 1)) * pull * subDt;

          if (dist < pocket.radius * 0.9) {
            coin.isPocketed = true;
            coin.vx = 0;
            coin.vy = 0;
            result.pocketedCoins.push(coin);
            soundManager.playPocketChime(coin.type);
            break;
          }
        }
      }
    }
  }

  // Check overall motion
  const strikerMotion = striker.isMoving && (Math.hypot(striker.vx, striker.vy) > 0.5);
  const coinsMotion = coins.some(c => !c.isPocketed && Math.hypot(c.vx, c.vy) > 0.5);
  result.hasMotion = strikerMotion || coinsMotion;

  if (striker.isMoving && !strikerMotion && !coinsMotion) {
    striker.isMoving = false;
  }

  return result;
}

/**
 * Checks if a given position on the baseline is valid (not overlapping with coins)
 */
export function isStrikerPlacementValid(
  x: number,
  baselineY: number,
  coins: Coin[]
): boolean {
  if (x < BASELINE_MIN_X || x > BASELINE_MAX_X) return false;
  for (const coin of coins) {
    if (coin.isPocketed) continue;
    const dist = Math.hypot(coin.x - x, coin.y - baselineY);
    if (dist < STRIKER_RADIUS + coin.radius + 1) {
      return false;
    }
  }
  return true;
}

/**
 * Calculates predictive trajectory for the aiming line
 */
export function calculateShotTrajectory(
  striker: Striker,
  coins: Coin[],
  angle: number,
  power: number
): ShotPrediction {
  const startX = striker.x;
  const startY = striker.y;
  const maxDistance = 450;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  const strikerLine: TrajectoryPoint[] = [{ x: startX, y: startY }];

  // Raycast to find closest coin hit or wall hit
  let closestDist = maxDistance;
  let hitCoin: Coin | undefined;

  for (const coin of coins) {
    if (coin.isPocketed) continue;

    // Vector from striker to coin
    const cx = coin.x - startX;
    const cy = coin.y - startY;

    // Projection along ray
    const proj = cx * dirX + cy * dirY;
    if (proj <= 0) continue; // behind striker

    // Perpendicular distance squared
    const perpSq = cx * cx + cy * cy - proj * proj;
    const hitRadius = striker.radius + coin.radius;

    if (perpSq <= hitRadius * hitRadius) {
      const d = proj - Math.sqrt(Math.max(0, hitRadius * hitRadius - perpSq));
      if (d > 0 && d < closestDist) {
        closestDist = d;
        hitCoin = coin;
      }
    }
  }

  // Check cushion bounds if no coin hit before wall
  const endX = startX + dirX * closestDist;
  const endY = startY + dirY * closestDist;
  strikerLine.push({ x: endX, y: endY });

  if (hitCoin) {
    // Calculate deflection trajectory of hit coin
    const contactX = endX;
    const contactY = endY;
    const normalX = (hitCoin.x - contactX);
    const normalY = (hitCoin.y - contactY);
    const nDist = Math.hypot(normalX, normalY) || 1;
    const nx = normalX / nDist;
    const ny = normalY / nDist;

    const coinSpeedDist = 180 * power;
    const targetLine: TrajectoryPoint[] = [
      { x: hitCoin.x, y: hitCoin.y },
      { x: hitCoin.x + nx * coinSpeedDist, y: hitCoin.y + ny * coinSpeedDist }
    ];

    // Predict if aiming towards a pocket
    let predictedPocket: Pocket | undefined;
    for (const pocket of POCKETS) {
      const pdx = pocket.x - hitCoin.x;
      const pdy = pocket.y - hitCoin.y;
      const pDist = Math.hypot(pdx, pdy);
      const dot = (pdx / pDist) * nx + (pdy / pDist) * ny;
      if (dot > 0.96) {
        predictedPocket = pocket;
        break;
      }
    }

    return {
      strikerLine,
      targetCoin: hitCoin,
      targetLine,
      predictedPocket
    };
  }

  return { strikerLine };
}
