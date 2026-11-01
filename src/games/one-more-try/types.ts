export type PowerUpType = 'shield' | 'magnet' | 'slowmo' | 'multiplier';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  duration: number;
  collected: boolean;
  pulse: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  maxTime: number;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  radius: number;
  value: number;
  collected: boolean;
  pulse: number;
}

export type ObstacleType = 
  | 'horizontal_bar' 
  | 'spinner' 
  | 'pulsing_orb' 
  | 'laser_gate' 
  | 'sliding_door' 
  | 'zigzag_blades';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  angle: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  minX?: number;
  maxX?: number;
  passed: boolean;
  scored: boolean;
  nearMissed: boolean;
  color: string;
  glowColor: string;
}

export interface BallSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  color: string;
  glowColor: string;
  trailColor: string;
  particleType: 'plasma' | 'fire' | 'star' | 'matrix' | 'neon' | 'gold' | 'void';
  unlocked: boolean;
  icon: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  controlMode: 'tap_switch' | 'drag_steer';
  playerName: string;
}

export interface ChallengeData {
  challengerName: string;
  targetScore: number;
  seed?: number;
  skinId?: string;
}
