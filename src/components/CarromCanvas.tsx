import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Coin, Striker, Pocket, ShotPrediction } from '../types/carrom';
import { 
  BOARD_SIZE, 
  CUSHION_WIDTH, 
  PLAY_AREA_MIN, 
  PLAY_AREA_MAX, 
  POCKETS, 
  COIN_RADIUS, 
  BASELINE_MIN_X, 
  BASELINE_MAX_X, 
  BASELINE_P1_Y, 
  BASELINE_P2_Y,
  calculateShotTrajectory,
  isStrikerPlacementValid
} from '../physics/engine';
import { soundManager } from '../audio/soundEffects';
import { triggerSubtleTickHaptic, triggerImpactHaptic } from '../utils/haptics';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface CarromCanvasProps {
  coins: Coin[];
  striker: Striker;
  isMyTurn: boolean;
  isMoving: boolean;
  onShoot: (angle: number, power: number) => void;
  onStrikerPositionChange: (newX: number) => void;
  activePlayerId: string;
  showGuideLine?: boolean;
  showCollisionPreview?: boolean;
  selectedTargetCoinId?: string | null;
  onSelectTargetCoin?: (coinId: string | null) => void;
  isPracticeMode?: boolean;
}

export const CarromCanvas: React.FC<CarromCanvasProps> = ({
  coins,
  striker,
  isMyTurn,
  isMoving,
  onShoot,
  onStrikerPositionChange,
  activePlayerId,
  showGuideLine = true,
  showCollisionPreview = true,
  selectedTargetCoinId = null,
  onSelectTargetCoin,
  isPracticeMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction states
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(striker.angle);
  const [aimPower, setAimPower] = useState(0.5);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const lastHapticPowerStepRef = useRef(0);

  // Convert client pointer coordinates to internal 800x800 board coords
  const getBoardCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = BOARD_SIZE / rect.width;
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale,
    };
  }, []);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isMyTurn || isMoving || striker.isPocketed) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const { x, y } = getBoardCoords(e.clientX, e.clientY);
    const distToStriker = Math.hypot(x - striker.x, y - striker.y);

    // 1. Check if user is touching the baseline track to reposition striker safely
    const isTouchingBaseline =
      Math.abs(y - striker.baselineY) <= 38 &&
      x >= BASELINE_MIN_X - 40 &&
      x <= BASELINE_MAX_X + 40;

    if (isTouchingBaseline || distToStriker <= striker.radius * 1.4) {
      // If tapped on or near baseline: activate repositioning mode
      // This prevents any accidental shots while placing striker!
      setIsRepositioning(true);
      triggerSubtleTickHaptic();
      const clampedX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, x));
      if (isStrikerPlacementValid(clampedX, striker.baselineY, coins)) {
        onStrikerPositionChange(clampedX);
      }
      return;
    }

    // Check if clicked on a coin in Practice Mode (to select/inspect target coin)
    if (isPracticeMode && onSelectTargetCoin) {
      const clickedCoin = coins.find(
        (c) => !c.isPocketed && Math.hypot(x - c.x, y - c.y) <= c.radius * 1.5
      );
      if (clickedCoin) {
        onSelectTargetCoin(selectedTargetCoinId === clickedCoin.id ? null : clickedCoin.id);
        soundManager.playTick();
        triggerSubtleTickHaptic();
        return;
      }
    }

    // 2. Hand-Control Aiming: Drag to aim & pull-back for shot power
    const isPullBack = y > striker.y && activePlayerId === 'player1';
    const angle = isPullBack
      ? Math.atan2(-(y - striker.y), -(x - striker.x))
      : Math.atan2(y - striker.y, x - striker.x);

    setAimAngle(angle);
    const calculatedPower = Math.min(1.0, Math.max(0.2, distToStriker / 160));
    setAimPower(calculatedPower);
    lastHapticPowerStepRef.current = Math.floor(calculatedPower * 14);
    setIsAiming(true);
    triggerSubtleTickHaptic();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMyTurn || isMoving) return;
    const { x, y } = getBoardCoords(e.clientX, e.clientY);

    if (isRepositioning) {
      const clampedX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, x));
      if (isStrikerPlacementValid(clampedX, striker.baselineY, coins)) {
        onStrikerPositionChange(clampedX);
        triggerSubtleTickHaptic();
      }
    } else if (isAiming) {
      const dx = x - striker.x;
      const dy = y - striker.y;
      const dist = Math.hypot(dx, dy);

      // Support intuitive Miniclip slingshot pull-back or forward directional drag
      const isPullBack = (dy > 0 && striker.baselineY > 400) || (dy < 0 && striker.baselineY < 400);
      const angle = isPullBack ? Math.atan2(-dy, -dx) : Math.atan2(dy, dx);

      setAimAngle(angle);
      const calculatedPower = Math.min(1.0, Math.max(0.18, dist / 175));
      setAimPower(calculatedPower);

      // Subtle haptic vibration notch as user pulls back
      const powerStep = Math.floor(calculatedPower * 14);
      if (powerStep !== lastHapticPowerStepRef.current) {
        lastHapticPowerStepRef.current = powerStep;
        triggerSubtleTickHaptic();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isAiming) {
      setIsAiming(false);
      const { x, y } = getBoardCoords(e.clientX, e.clientY);
      const dist = Math.hypot(x - striker.x, y - striker.y);

      // Launch if pulled/dragged beyond threshold (Miniclip release-to-shoot mechanic)
      if (dist >= 24) {
        onShoot(aimAngle, aimPower);
        soundManager.playStrikerLaunch();
        triggerImpactHaptic();
      }
    }
    if (isRepositioning) {
      setIsRepositioning(false);
    }
  };

  // Add spark particles
  const addSparks = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color,
        size: Math.random() * 2.5 + 1.5,
      });
    }
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. Draw Outer Frame (Rich Dark Rosewood / Mahogany Board with Golden Brass Corner Bumpers)
      const frameGrad = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
      frameGrad.addColorStop(0, '#381c0c'); // Deep polished rosewood
      frameGrad.addColorStop(0.5, '#241006'); // Dark mahogany
      frameGrad.addColorStop(1, '#150903'); // Ebony rosewood
      ctx.fillStyle = frameGrad;
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Outer Golden Brass Corner Reinforcements / Bumpers
      const bumperSize = 75;
      const drawCornerBumper = (bx: number, by: number, startAngle: number) => {
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(bx, by, bumperSize, startAngle, startAngle + Math.PI / 2);
        ctx.lineTo(bx, by);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Brass screw rivets
        const rx = bx === 0 ? 32 : BOARD_SIZE - 32;
        const ry = by === 0 ? 32 : BOARD_SIZE - 32;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCornerBumper(0, 0, 0);
      drawCornerBumper(BOARD_SIZE, 0, Math.PI / 2);
      drawCornerBumper(BOARD_SIZE, BOARD_SIZE, Math.PI);
      drawCornerBumper(0, BOARD_SIZE, (Math.PI * 3) / 2);

      // Inner Cushion Rail (Polished Hardwood Cushion)
      ctx.fillStyle = '#2b1307';
      ctx.fillRect(CUSHION_WIDTH - 6, CUSHION_WIDTH - 6, BOARD_SIZE - (CUSHION_WIDTH - 6) * 2, BOARD_SIZE - (CUSHION_WIDTH - 6) * 2);

      // Subtle Golden Gaming Neon Accent on inner cushion edge
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(PLAY_AREA_MIN, PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN);

      // 2. Playing Surface (Realistic Polished English Birch / Honey Maple Wooden Surface)
      const woodGrad = ctx.createRadialGradient(
        BOARD_SIZE / 2,
        BOARD_SIZE / 2,
        60,
        BOARD_SIZE / 2,
        BOARD_SIZE / 2,
        480
      );
      woodGrad.addColorStop(0, '#fcedc7'); // Natural honey maple center
      woodGrad.addColorStop(0.4, '#f2dcab'); // Warm birch ply
      woodGrad.addColorStop(0.8, '#e5ca95'); // Fine wood tint
      woodGrad.addColorStop(1, '#d4b375'); // Darkened edge grain
      ctx.fillStyle = woodGrad;
      ctx.fillRect(PLAY_AREA_MIN, PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN);

      // Subtle natural wood grain lines across the board
      ctx.strokeStyle = 'rgba(161, 98, 7, 0.06)';
      ctx.lineWidth = 1;
      for (let i = PLAY_AREA_MIN + 25; i < PLAY_AREA_MAX; i += 28) {
        ctx.beginPath();
        ctx.moveTo(PLAY_AREA_MIN, i);
        ctx.bezierCurveTo(BOARD_SIZE * 0.35, i + 3, BOARD_SIZE * 0.65, i - 2, PLAY_AREA_MAX, i + 1);
        ctx.stroke();
      }

      // Lacquer Gloss Reflection across playing surface
      const glossGrad = ctx.createLinearGradient(PLAY_AREA_MIN, PLAY_AREA_MIN, PLAY_AREA_MAX, PLAY_AREA_MAX);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      glossGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
      glossGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.02)');
      glossGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(PLAY_AREA_MIN, PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN, PLAY_AREA_MAX - PLAY_AREA_MIN);

      // 3. Four Realistic Deep Black Corner Pockets
      for (const pocket of POCKETS) {
        // Outer beveled wood pocket boundary
        ctx.strokeStyle = '#1e0d04';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius + 3.5, 0, Math.PI * 2);
        ctx.stroke();

        // Pocket Interior (Solid Deep Void Black Hole)
        const holeGrad = ctx.createRadialGradient(pocket.x, pocket.y, 1, pocket.x, pocket.y, pocket.radius);
        holeGrad.addColorStop(0, '#000000');
        holeGrad.addColorStop(0.85, '#080808');
        holeGrad.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = holeGrad;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
        ctx.fill();

        // Realistic woven pocket net mesh inside pocket
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        for (let r = 7; r <= pocket.radius - 4; r += 7) {
          ctx.beginPath();
          ctx.arc(pocket.x, pocket.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let a = 0; a < 8; a++) {
          const ang = (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(pocket.x, pocket.y);
          ctx.lineTo(pocket.x + Math.cos(ang) * (pocket.radius - 2), pocket.y + Math.sin(ang) * (pocket.radius - 2));
          ctx.stroke();
        }
      }

      // 4. Center Circles & Authentic Carrom Mandala
      const cx = BOARD_SIZE / 2;
      const cy = BOARD_SIZE / 2;

      // Outer Center Ring (Classic Maroon / Mahogany)
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 78, 0, Math.PI * 2);
      ctx.stroke();

      // Middle Ring
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.stroke();

      // Authentic 12-Leaf Mandala Petals radiating from center
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        ctx.strokeStyle = i % 2 === 0 ? '#991b1b' : '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 48, cy + Math.sin(ang) * 48);
        ctx.lineTo(cx + Math.cos(ang) * 78, cy + Math.sin(ang) * 78);
        ctx.stroke();

        // Small decorative diamond/dot at tip
        ctx.fillStyle = i % 2 === 0 ? '#b91c1c' : '#1e1b4b';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * 63, cy + Math.sin(ang) * 63, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Queen Spot (Red Sun Core Spot)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 5. Draw 4 Baselines (Top, Bottom, Left, Right) with authentic Foul Circles
      const drawBaseline = (isVertical: boolean, fixedCoord: number, isP1: boolean, isP2: boolean) => {
        const minVal = BASELINE_MIN_X;
        const maxVal = BASELINE_MAX_X;
        const circleR = 21;

        const isCurrentActive = (isP1 && activePlayerId === 'player1') || (isP2 && activePlayerId !== 'player1');

        ctx.strokeStyle = isCurrentActive ? 'rgba(56, 189, 248, 0.85)' : 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 2;

        // Two parallel baseline tracks (standard carrom)
        const gap = 14;
        if (!isVertical) {
          // Horizontal line
          ctx.beginPath();
          ctx.moveTo(minVal, fixedCoord - gap / 2);
          ctx.lineTo(maxVal, fixedCoord - gap / 2);
          ctx.moveTo(minVal, fixedCoord + gap / 2);
          ctx.lineTo(maxVal, fixedCoord + gap / 2);
          ctx.stroke();

          // End baseline circles (red foul circles)
          [minVal, maxVal].forEach(bx => {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath();
            ctx.arc(bx, fixedCoord, circleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner gold dot
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(bx, fixedCoord, 5, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          // Vertical lines (for realistic board aesthetic)
          ctx.beginPath();
          ctx.moveTo(fixedCoord - gap / 2, minVal);
          ctx.lineTo(fixedCoord - gap / 2, maxVal);
          ctx.moveTo(fixedCoord + gap / 2, minVal);
          ctx.lineTo(fixedCoord + gap / 2, maxVal);
          ctx.stroke();

          [minVal, maxVal].forEach(by => {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.beginPath();
            ctx.arc(fixedCoord, by, circleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        }
      };

      drawBaseline(false, BASELINE_P1_Y, true, false); // Bottom P1
      drawBaseline(false, BASELINE_P2_Y, false, true); // Top P2/AI
      drawBaseline(true, 140, false, false); // Left
      drawBaseline(true, BOARD_SIZE - 140, false, false); // Right

      // 4 Foul Arrow Vectors pointing towards each pocket
      const drawCornerArrow = (startX: number, startY: number, targetPocket: Pocket) => {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1.5;
        const ang = Math.atan2(targetPocket.y - startY, targetPocket.x - startX);
        const len = 75;
        const ex = startX + Math.cos(ang) * len;
        const ey = startY + Math.sin(ang) * len;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCornerArrow(BASELINE_MIN_X, BASELINE_P1_Y, POCKETS[2]);
      drawCornerArrow(BASELINE_MAX_X, BASELINE_P1_Y, POCKETS[3]);
      drawCornerArrow(BASELINE_MIN_X, BASELINE_P2_Y, POCKETS[0]);
      drawCornerArrow(BASELINE_MAX_X, BASELINE_P2_Y, POCKETS[1]);

      // 6. Draw Aiming Line & Trajectory Prediction (when user is aiming)
      if (isMyTurn && !isMoving && !striker.isPocketed) {
        const prediction = calculateShotTrajectory(striker, coins, aimAngle, aimPower);

        // Striker aim ray (Laser style)
        if (showGuideLine && prediction.strikerLine.length >= 2) {
          const [start, end] = prediction.strikerLine;
          const laserGrad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
          laserGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
          laserGrad.addColorStop(1, 'rgba(34, 211, 238, 0.2)');

          ctx.strokeStyle = laserGrad;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 5]);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ghost striker circle at contact point
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(end.x, end.y, striker.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Deflected target coin predicted trajectory line
        if (showCollisionPreview && prediction.targetLine && prediction.targetLine.length >= 2) {
          const [tStart, tEnd] = prediction.targetLine;
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(tStart.x, tStart.y);
          ctx.lineTo(tEnd.x, tEnd.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Target pocket highlight glow if in alignment
          if (prediction.predictedPocket) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
              prediction.predictedPocket.x,
              prediction.predictedPocket.y,
              prediction.predictedPocket.radius + 8,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }
        }
      }

      // 6.5 Training Aid: Selected Target Coin Guidance
      if (selectedTargetCoinId) {
        const targetCoin = coins.find((c) => c.id === selectedTargetCoinId && !c.isPocketed);
        if (targetCoin) {
          // Find closest pocket to target coin
          let bestPocket = POCKETS[0];
          let bestDist = Infinity;
          for (const p of POCKETS) {
            const d = Math.hypot(p.x - targetCoin.x, p.y - targetCoin.y);
            if (d < bestDist) {
              bestDist = d;
              bestPocket = p;
            }
          }

          // Draw dotted line from coin to best pocket
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(targetCoin.x, targetCoin.y);
          ctx.lineTo(bestPocket.x, bestPocket.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Highlight best pocket
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(bestPocket.x, bestPocket.y, bestPocket.radius + 5, 0, Math.PI * 2);
          ctx.stroke();

          // Calculate and draw Ghost Ball position
          const pDirX = (bestPocket.x - targetCoin.x) / bestDist;
          const pDirY = (bestPocket.y - targetCoin.y) / bestDist;
          const ghostX = targetCoin.x - pDirX * (targetCoin.radius + striker.radius);
          const ghostY = targetCoin.y - pDirY * (targetCoin.radius + striker.radius);

          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, striker.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Ghost ball center target dot
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, 3, 0, Math.PI * 2);
          ctx.fill();

          // Draw cosmic targeting reticle brackets around selected coin
          const r = targetCoin.radius + 7;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(targetCoin.x, targetCoin.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 7. Draw Coins
      for (const coin of coins) {
        if (coin.isPocketed) continue;

        ctx.save();
        ctx.translate(coin.x, coin.y);

        // 3D Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        if (coin.type === 'red') {
          // RED QUEEN (50 points) - Radiant Solar Queen
          const redGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, coin.radius);
          redGrad.addColorStop(0, '#fef08a'); // sun highlight
          redGrad.addColorStop(0.2, '#f43f5e'); // ruby
          redGrad.addColorStop(0.7, '#be123c'); // deep rose
          redGrad.addColorStop(1, '#881337'); // crimson rim
          ctx.fillStyle = redGrad;
          ctx.beginPath();
          ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
          ctx.fill();

          // Gold Solar Queen Crown rim
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Crown insignia in center
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (coin.type === 'white') {
          // WHITE COIN (20 points) - Lunar Starlight
          const whiteGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, coin.radius);
          whiteGrad.addColorStop(0, '#ffffff');
          whiteGrad.addColorStop(0.3, '#f1f5f9');
          whiteGrad.addColorStop(0.8, '#cbd5e1');
          whiteGrad.addColorStop(1, '#94a3b8');
          ctx.fillStyle = whiteGrad;
          ctx.beginPath();
          ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
          ctx.fill();

          // Concentric circular grooves
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, coin.radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // BLACK COIN (10 points) - Dark Matter Eclipse
          const blackGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, coin.radius);
          blackGrad.addColorStop(0, '#475569');
          blackGrad.addColorStop(0.4, '#1e293b');
          blackGrad.addColorStop(0.85, '#0f172a');
          blackGrad.addColorStop(1, '#020617');
          ctx.fillStyle = blackGrad;
          ctx.beginPath();
          ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
          ctx.fill();

          // Obsidian edge groove
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, coin.radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 8. Draw Striker (Astronaut Chrono-Striker)
      if (!striker.isPocketed) {
        ctx.save();
        ctx.translate(striker.x, striker.y);

        // Striker Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 5;

        // Striker body gradient (Space Titanium & Cyan Core)
        const strikerGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, striker.radius);
        strikerGrad.addColorStop(0, '#e0f2fe');
        strikerGrad.addColorStop(0.3, '#38bdf8');
        strikerGrad.addColorStop(0.75, '#0284c7');
        strikerGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = strikerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, striker.radius, 0, Math.PI * 2);
        ctx.fill();

        // High-tech Neon Cyan energy ring
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, striker.radius - 1, 0, Math.PI * 2);
        ctx.stroke();

        // Inner gyro circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, striker.radius * 0.55, 0, Math.PI * 2);
        ctx.stroke();

        // Center astronaut power gem
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Targeting indicator pointing in aim direction
        if (isMyTurn && !isMoving) {
          ctx.rotate(aimAngle);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(striker.radius - 2, -4);
          ctx.lineTo(striker.radius + 9, 0);
          ctx.lineTo(striker.radius - 2, 4);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // 9. Particle Spark simulation & rendering
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.92;
        p.size *= 0.95;

        if (p.alpha <= 0.05) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [coins, striker, isMyTurn, isMoving, aimAngle, aimPower, activePlayerId, showGuideLine, showCollisionPreview, selectedTargetCoinId]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="max-h-full max-w-full aspect-square rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] cursor-crosshair touch-none select-none border-2 border-amber-950/70"
      />
    </div>
  );
};
