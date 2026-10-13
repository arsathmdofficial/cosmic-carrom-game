export type CoinType = 'red' | 'white' | 'black';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Coin {
  id: string;
  type: CoinType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  points: number;
  isPocketed: boolean;
  pocketScale: number; // For pocket falling animation (1 -> 0)
  glowAlpha?: number;
}

export interface Striker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isPlaced: boolean;
  isMoving: boolean;
  baselineY: number; // Y position of current baseline
  baselineMinX: number;
  baselineMaxX: number;
  angle: number; // Shooting angle in radians
  power: number; // 0 to 1
  isPocketed: boolean;
  pocketScale: number;
}

export interface Pocket {
  id: number;
  x: number;
  y: number;
  radius: number;
  pullRadius: number;
}

export type GameMode = 'practice' | '2players' | 'computer';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AssignedColor = 'white' | 'black' | 'all';
export type ControlMode = 'hand' | 'slider';

export interface PlayerStats {
  id: 'player1' | 'player2' | 'computer';
  name: string;
  score: number;
  assignedColor: AssignedColor;
  coinsRemaining: number;
  redPocketed: number;
  whitePocketed: number;
  blackPocketed: number;
  fouls: number;
  avatar: string;
}

export type GameStatus = 'welcome' | 'menu' | 'playing' | 'paused' | 'gameover';

export interface QueenStatus {
  pocketedBy: 'player1' | 'player2' | 'computer' | null;
  needsCover: boolean;
  covered: boolean;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface ShotPrediction {
  strikerLine: TrajectoryPoint[];
  targetCoin?: Coin;
  targetLine?: TrajectoryPoint[];
  predictedPocket?: Pocket;
}

export interface PracticeState {
  shotsTaken: number;
  bestScore: number;
  strictRules: boolean;
  showGuideLine: boolean;
  showCollisionPreview: boolean;
  selectedTargetCoinId: string | null;
}

export interface BoardSnapshot {
  coins: Coin[];
  striker: Striker;
  player1: PlayerStats;
  queenStatus: QueenStatus;
  shotsTaken: number;
}


