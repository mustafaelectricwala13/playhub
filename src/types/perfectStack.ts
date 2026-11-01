export interface BlockState {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  color: string;
}

export interface CutPieceState {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  vy: number;
  vx: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  alpha: number;
}

export interface BlockSkin {
  id: string;
  name: string;
  price: number;
  unlocked: boolean;
  palette: string[];
  ambientColor: number;
  directionalColor: number;
  bgGradient: [string, string];
}

