import { Obstacle, Coin, PowerUp, PowerUpType, ObstacleType } from './types';

export class PatternGenerator {
  private patternCounter: number = 0;
  private arenaWidth: number;
  private arenaHeight: number;

  constructor(arenaWidth: number = 400, arenaHeight: number = 700) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;
  }

  public setDimensions(width: number, height: number) {
    this.arenaWidth = width;
    this.arenaHeight = height;
  }

  /**
   * Generates a new obstacle wave at a given Y position above the screen
   */
  public generateWave(
    spawnY: number,
    score: number,
    isDaily: boolean = false
  ): {
    obstacles: Obstacle[];
    coins: Coin[];
    powerUps: PowerUp[];
  } {
    this.patternCounter++;
    const speedMultiplier = 1 + Math.min(score / 45, 1.4);
    const obstacles: Obstacle[] = [];
    const coins: Coin[] = [];
    const powerUps: PowerUp[] = [];

    // Colors matching cyber arcade theme
    const neonPalettes = [
      { color: '#FF0055', glow: 'rgba(255, 0, 85, 0.8)' },
      { color: '#00F0FF', glow: 'rgba(0, 240, 255, 0.8)' },
      { color: '#FFB800', glow: 'rgba(255, 184, 0, 0.8)' },
      { color: '#B000FF', glow: 'rgba(176, 0, 255, 0.8)' },
      { color: '#00FF66', glow: 'rgba(0, 255, 102, 0.8)' },
    ];
    const palette = neonPalettes[this.patternCounter % neonPalettes.length];

    const types: ObstacleType[] = [
      'sliding_door',
      'spinner',
      'pulsing_orb',
      'laser_gate',
      'zigzag_blades',
      'horizontal_bar'
    ];

    // Progression: earlier levels introduce sliding doors and spinners, later levels add crushers and lasers
    let allowedTypes = types.slice(0, 3);
    if (score > 15) allowedTypes = types.slice(0, 5);
    if (score > 30) allowedTypes = types;

    const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const idPrefix = `obs-${Date.now()}-${this.patternCounter}`;

    switch (chosenType) {
      case 'sliding_door': {
        // Two sliding bars leaving an opening of ~90px
        const gapSize = Math.max(75, 105 - score * 0.4);
        const gapCenter = 80 + Math.random() * (this.arenaWidth - 160);
        const barHeight = 22;

        // Left Bar
        obstacles.push({
          id: `${idPrefix}-left`,
          type: 'sliding_door',
          x: 0,
          y: spawnY,
          width: gapCenter - gapSize / 2,
          height: barHeight,
          angle: 0,
          rotSpeed: 0,
          vx: (Math.random() > 0.5 ? 1 : -1) * (40 + score * 0.8),
          vy: 0,
          minX: -30,
          maxX: 30,
          passed: false,
          scored: false,
          nearMissed: false,
          color: palette.color,
          glowColor: palette.glow
        });

        // Right Bar
        obstacles.push({
          id: `${idPrefix}-right`,
          type: 'sliding_door',
          x: gapCenter + gapSize / 2,
          y: spawnY,
          width: this.arenaWidth - (gapCenter + gapSize / 2),
          height: barHeight,
          angle: 0,
          rotSpeed: 0,
          vx: (Math.random() > 0.5 ? 1 : -1) * (40 + score * 0.8),
          vy: 0,
          passed: false,
          scored: false,
          nearMissed: false,
          color: palette.color,
          glowColor: palette.glow
        });

        // Coin placed directly in the gap
        coins.push({
          id: `coin-${idPrefix}`,
          x: gapCenter,
          y: spawnY + 11,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        break;
      }

      case 'spinner': {
        // Rotating laser crossbar
        const barLength = Math.min(160, 110 + score * 0.8);
        const barThickness = 18;
        const centerX = 90 + Math.random() * (this.arenaWidth - 180);
        const rotDirection = Math.random() > 0.5 ? 1 : -1;

        obstacles.push({
          id: `${idPrefix}-spinner`,
          type: 'spinner',
          x: centerX,
          y: spawnY,
          width: barLength,
          height: barThickness,
          angle: Math.random() * Math.PI,
          rotSpeed: rotDirection * (1.8 + Math.min(score * 0.03, 1.2)),
          vx: (Math.random() - 0.5) * 30,
          vy: 0,
          passed: false,
          scored: false,
          nearMissed: false,
          color: palette.color,
          glowColor: palette.glow
        });

        // Arc of 2 coins around the spinner
        coins.push({
          id: `coin-sp1-${idPrefix}`,
          x: centerX - 60,
          y: spawnY - 30,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        coins.push({
          id: `coin-sp2-${idPrefix}`,
          x: centerX + 60,
          y: spawnY + 30,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        break;
      }

      case 'pulsing_orb': {
        // Glowing hazards moving in oscillating orbits
        const orbRadius = 18;
        const startX = 60 + Math.random() * (this.arenaWidth - 120);

        obstacles.push({
          id: `${idPrefix}-orb1`,
          type: 'pulsing_orb',
          x: startX,
          y: spawnY,
          width: orbRadius * 2,
          height: orbRadius * 2,
          radius: orbRadius,
          angle: 0,
          rotSpeed: 0,
          vx: 80 * speedMultiplier * (Math.random() > 0.5 ? 1 : -1),
          vy: 0,
          passed: false,
          scored: false,
          nearMissed: false,
          color: '#FF0055',
          glowColor: 'rgba(255, 0, 85, 0.9)'
        });

        if (score > 20) {
          obstacles.push({
            id: `${idPrefix}-orb2`,
            type: 'pulsing_orb',
            x: (startX + 140) % (this.arenaWidth - 60) + 30,
            y: spawnY + 30,
            width: orbRadius * 2,
            height: orbRadius * 2,
            radius: orbRadius,
            angle: 0,
            rotSpeed: 0,
            vx: -80 * speedMultiplier,
            vy: 0,
            passed: false,
            scored: false,
            nearMissed: false,
            color: '#FF0055',
            glowColor: 'rgba(255, 0, 85, 0.9)'
          });
        }
        break;
      }

      case 'zigzag_blades': {
        // Diamond shaped hazard sweeping across
        const bladeSize = 36;
        const centerX = this.arenaWidth / 2;

        obstacles.push({
          id: `${idPrefix}-blade`,
          type: 'zigzag_blades',
          x: centerX,
          y: spawnY,
          width: bladeSize,
          height: bladeSize,
          radius: bladeSize / 2,
          angle: Math.PI / 4,
          rotSpeed: 3.5,
          vx: (Math.random() > 0.5 ? 1 : -1) * (110 + score * 0.7),
          vy: 0,
          passed: false,
          scored: false,
          nearMissed: false,
          color: '#00F0FF',
          glowColor: 'rgba(0, 240, 255, 0.9)'
        });

        // Safe coin path on the sides
        coins.push({
          id: `coin-side1-${idPrefix}`,
          x: 45,
          y: spawnY,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        coins.push({
          id: `coin-side2-${idPrefix}`,
          x: this.arenaWidth - 45,
          y: spawnY,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        break;
      }

      case 'laser_gate':
      case 'horizontal_bar':
      default: {
        // Floating block with bouncing trajectory
        const blockW = Math.min(130, 80 + score * 0.7);
        const blockH = 22;
        const xPos = 40 + Math.random() * (this.arenaWidth - blockW - 80);

        obstacles.push({
          id: `${idPrefix}-bar`,
          type: 'horizontal_bar',
          x: xPos,
          y: spawnY,
          width: blockW,
          height: blockH,
          angle: 0,
          rotSpeed: 0,
          vx: (Math.random() > 0.5 ? 1 : -1) * (70 + score * 0.9),
          vy: 0,
          passed: false,
          scored: false,
          nearMissed: false,
          color: palette.color,
          glowColor: palette.glow
        });

        // Coin cluster above/below
        coins.push({
          id: `coin-cluster-${idPrefix}`,
          x: (xPos + blockW + 50) % (this.arenaWidth - 60) + 30,
          y: spawnY,
          radius: 9,
          value: 1,
          collected: false,
          pulse: 0
        });
        break;
      }
    }

    // Occasional Power-up spawn (~every 6-8 patterns)
    if (this.patternCounter % 7 === 0) {
      const pTypes: PowerUpType[] = ['shield', 'magnet', 'slowmo', 'multiplier'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      powerUps.push({
        id: `pow-${Date.now()}-${this.patternCounter}`,
        type: pType,
        x: 60 + Math.random() * (this.arenaWidth - 120),
        y: spawnY - 60,
        radius: 14,
        duration: pType === 'slowmo' ? 6 : pType === 'multiplier' ? 8 : 8,
        collected: false,
        pulse: 0
      });
    }

    return { obstacles, coins, powerUps };
  }
}

