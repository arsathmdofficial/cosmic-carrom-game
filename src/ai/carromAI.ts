import { Coin, Striker, AIDifficulty, Pocket } from '../types/carrom';
import { POCKETS, BASELINE_MIN_X, BASELINE_MAX_X, BASELINE_P2_Y, COIN_RADIUS, STRIKER_RADIUS } from '../physics/engine';

export interface AIShotPlan {
  baselineX: number;
  angle: number;
  power: number;
  targetCoin?: Coin;
  targetPocket?: Pocket;
  thinkingDelay: number;
}

/**
 * Computes computer shot based on selected difficulty level
 */
export function calculateAIShot(
  difficulty: AIDifficulty,
  coins: Coin[],
  striker: Striker,
  aiAssignedColor: 'white' | 'black' = 'black'
): AIShotPlan {
  const activeCoins = coins.filter(c => !c.isPocketed);
  if (activeCoins.length === 0) {
    return {
      baselineX: (BASELINE_MIN_X + BASELINE_MAX_X) / 2,
      angle: Math.PI / 2,
      power: 0.6,
      thinkingDelay: 1000,
    };
  }

  // AI only targets its legally assigned color and the Queen!
  const legalCoins = activeCoins.filter(c => c.type === 'red' || c.type === aiAssignedColor);
  const targetPool = legalCoins.length > 0 ? legalCoins : activeCoins;

  // Baseline Y for computer is BASELINE_P2_Y (top baseline = 140)
  const baselineY = BASELINE_P2_Y;

  // Prioritize coins: Red (50 pts) > Assigned Color
  const sortedCoins = [...targetPool].sort((a, b) => {
    if (a.type === 'red') return -1;
    if (b.type === 'red') return 1;
    if (a.type === aiAssignedColor) return -1;
    if (b.type === aiAssignedColor) return 1;
    return 0;
  });

  if (difficulty === 'easy') {
    // Beginner / 1-10 years old:
    // Picks a random active coin, positions baseline near it, aims with high random error
    const randomCoin = activeCoins[Math.floor(Math.random() * activeCoins.length)];
    const rawX = randomCoin.x + (Math.random() * 80 - 40);
    const baselineX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, rawX));

    // Direct angle from striker to coin + large novice deviation
    const dx = randomCoin.x - baselineX;
    const dy = randomCoin.y - baselineY;
    const baseAngle = Math.atan2(dy, dx);
    const angleError = (Math.random() - 0.5) * 0.45; // up to ~25 degrees error!
    const power = 0.35 + Math.random() * 0.45; // inconsistent power

    return {
      baselineX,
      angle: baseAngle + angleError,
      power,
      targetCoin: randomCoin,
      thinkingDelay: 1200 + Math.random() * 800,
    };
  }

  if (difficulty === 'medium') {
    // Intermediate / 11-20 years old:
    // Tries to find a coin with a good angle to any pocket
    let bestPlan: AIShotPlan | null = null;
    let bestScore = -999;

    // Test a few baseline positions
    const samplePositions = [240, 320, 400, 480, 560];

    for (const bX of samplePositions) {
      for (const coin of sortedCoins) {
        for (const pocket of POCKETS) {
          // Vector from coin to pocket
          const cpX = pocket.x - coin.x;
          const cpY = pocket.y - coin.y;
          const cpDist = Math.hypot(cpX, cpY);
          if (cpDist === 0) continue;

          // Ghost ball position behind the coin
          const ghostX = coin.x - (cpX / cpDist) * (COIN_RADIUS + STRIKER_RADIUS);
          const ghostY = coin.y - (cpY / cpDist) * (COIN_RADIUS + STRIKER_RADIUS);

          // Angle from baseline to ghost ball
          const sgX = ghostX - bX;
          const sgY = ghostY - baselineY;
          const sgDist = Math.hypot(sgX, sgY);

          // If ghost ball is below baseline (for top AI), valid shot direction
          if (sgY > 15) {
            // Cut angle check: dot product between striker direction and coin-to-pocket
            const dot = (sgX / sgDist) * (cpX / cpDist) + (sgY / sgDist) * (cpY / cpDist);
            if (dot > 0.45) {
              const quality = dot * 100 - cpDist * 0.05 + (coin.type === 'red' ? 50 : coin.type === 'white' ? 25 : 10);
              if (quality > bestScore) {
                bestScore = quality;
                // Add moderate human imperfection (+- 4-7 degrees)
                const error = (Math.random() - 0.5) * 0.10;
                bestPlan = {
                  baselineX: bX,
                  angle: Math.atan2(sgY, sgX) + error,
                  power: Math.min(0.9, Math.max(0.45, 0.4 + (sgDist + cpDist) / 1200)),
                  targetCoin: coin,
                  targetPocket: pocket,
                  thinkingDelay: 1000 + Math.random() * 500,
                };
              }
            }
          }
        }
      }
    }

    if (bestPlan) return bestPlan;

    // Fallback: aim at best coin
    const target = sortedCoins[0];
    const bX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, target.x));
    return {
      baselineX: bX,
      angle: Math.atan2(target.y - baselineY, target.x - bX) + (Math.random() - 0.5) * 0.1,
      power: 0.65,
      targetCoin: target,
      thinkingDelay: 1000,
    };
  }

  // Hard Mode: Professional Carrom Master!
  // Exhaustive search over fine baseline positions, ghost balls, obstacle occlusion detection,
  // and precision power calculation.
  let masterPlan: AIShotPlan | null = null;
  let masterScore = -Infinity;

  // Test 15 distinct baseline positions
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const bX = BASELINE_MIN_X + (i / steps) * (BASELINE_MAX_X - BASELINE_MIN_X);

    for (const coin of sortedCoins) {
      for (const pocket of POCKETS) {
        // Distance and direction from coin to pocket
        const cpX = pocket.x - coin.x;
        const cpY = pocket.y - coin.y;
        const cpDist = Math.hypot(cpX, cpY);
        if (cpDist === 0) continue;

        // Ghost ball location for pocketing
        const ghostX = coin.x - (cpX / cpDist) * (COIN_RADIUS + STRIKER_RADIUS);
        const ghostY = coin.y - (cpY / cpDist) * (COIN_RADIUS + STRIKER_RADIUS);

        const sgX = ghostX - bX;
        const sgY = ghostY - baselineY;
        const sgDist = Math.hypot(sgX, sgY);

        // Striker must shoot forward into board (sgY > 20)
        if (sgY <= 20) continue;

        // Alignment check (cut angle)
        const strikerDirX = sgX / sgDist;
        const strikerDirY = sgY / sgDist;
        const pocketDirX = cpX / cpDist;
        const pocketDirY = cpY / cpDist;
        const cutAlignment = strikerDirX * pocketDirX + strikerDirY * pocketDirY;

        // In carrom, cuts greater than ~25 degrees (dot > 0.65) are realistic and high percentage
        if (cutAlignment < 0.60) continue;

        // Check for obstacle coins blocking striker path to ghost ball
        let blocked = false;
        for (const obs of activeCoins) {
          if (obs.id === coin.id) continue;
          // Distance of obs to striker line
          const ox = obs.x - bX;
          const oy = obs.y - baselineY;
          const proj = ox * strikerDirX + oy * strikerDirY;
          if (proj > 0 && proj < sgDist - 5) {
            const perpDist = Math.hypot(ox - proj * strikerDirX, oy - proj * strikerDirY);
            if (perpDist < obs.radius + STRIKER_RADIUS - 2) {
              blocked = true;
              break;
            }
          }
        }
        if (blocked) continue;

        // Check if path from coin to pocket is blocked
        for (const obs of activeCoins) {
          if (obs.id === coin.id) continue;
          const ox = obs.x - coin.x;
          const oy = obs.y - coin.y;
          const proj = ox * pocketDirX + oy * pocketDirY;
          if (proj > 0 && proj < cpDist - 10) {
            const perpDist = Math.hypot(ox - proj * pocketDirX, oy - proj * pocketDirY);
            if (perpDist < obs.radius + coin.radius - 2) {
              blocked = true;
              break;
            }
          }
        }
        if (blocked) continue;

        // Score this master shot
        let score = cutAlignment * 120 - cpDist * 0.08 - sgDist * 0.04;
        if (coin.type === 'red') score += 100;
        else if (coin.type === 'white') score += 40;
        else score += 20;

        if (score > masterScore) {
          masterScore = score;
          // Precision aim: almost zero error (0.005 radians = 0.28 deg)
          const angle = Math.atan2(sgY, sgX);
          // Optimal power: proportional to required distance
          const reqPower = Math.min(0.95, Math.max(0.5, (sgDist + cpDist * 1.2) / 950));
          masterPlan = {
            baselineX: bX,
            angle,
            power: reqPower,
            targetCoin: coin,
            targetPocket: pocket,
            thinkingDelay: 800 + Math.random() * 400,
          };
        }
      }
    }
  }

  if (masterPlan) return masterPlan;

  // Fallback if tight clusters: execute strategic break shot at center cluster
  const centerCoin = sortedCoins[0];
  const bX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, centerCoin.x));
  return {
    baselineX: bX,
    angle: Math.atan2(centerCoin.y - baselineY, centerCoin.x - bX),
    power: 0.85, // strong cluster break
    targetCoin: centerCoin,
    thinkingDelay: 900,
  };
}
