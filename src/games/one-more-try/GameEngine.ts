import { 
  BallSkin, 
  Obstacle, 
  Coin, 
  PowerUp, 
  ActivePowerUp, 
  PowerUpType, 
  GameSettings,
  ChallengeData
} from './types';
import { soundManager } from '../../audio/soundManager';
import { ParticleSystem } from './ParticleSystem';
import { PatternGenerator } from './ObstaclePatterns';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onCoinUpdate: (coins: number) => void;
  onComboUpdate: (combo: number) => void;
  onPowerUpUpdate: (activePowerUps: ActivePowerUp[]) => void;
  onGameOver: (finalScore: number, coinsEarned: number, nearMisses: number) => void;
  onNearMiss: (bonusPoints: number) => void;
  onChallengeBeaten?: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Virtual game arena dimensions
  public readonly virtualWidth = 420;
  public readonly virtualHeight = 720;
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  // Game state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isDying: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Player properties
  private player = {
    x: 210,
    y: 560,
    radius: 16,
    hitboxRadius: 10.5, // Fair forgiving hitbox (~66% of visual)
    vx: 320,
    direction: 1 as 1 | -1,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  };

  // Systems
  private particles: ParticleSystem;
  private patternGen: PatternGenerator;
  private currentSkin: BallSkin;
  private settings: GameSettings;
  private challenge: ChallengeData | null = null;
  private challengeBeatenAlerted: boolean = false;

  // Active game entities
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private powerUps: PowerUp[] = [];
  private activePowerUps: Map<PowerUpType, { remaining: number; max: number }> = new Map();

  // Metrics
  private score: number = 0;
  private coinsEarned: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private nearMissCount: number = 0;
  private invulnerableTimer: number = 0;

  // Timers & spawner
  private spawnTimer: number = 0;
  private spawnInterval: number = 2.0;

  // Screen shake & visual FX
  private screenShake: number = 0;
  private flashAlpha: number = 0;
  private flashColor: string = '#FFFFFF';

  constructor(
    canvas: HTMLCanvasElement,
    skin: BallSkin,
    settings: GameSettings,
    callbacks: GameEngineCallbacks,
    challenge: ChallengeData | null = null
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.currentSkin = skin;
    this.settings = settings;
    this.callbacks = callbacks;
    this.challenge = challenge;

    this.particles = new ParticleSystem();
    this.patternGen = new PatternGenerator(this.virtualWidth, this.virtualHeight);

    this.handleResize();
  }

  public handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    
    // Fit canvas to parent container while preserving aspect ratio
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Calculate virtual scale
    const scaleX = (rect.width * dpr) / this.virtualWidth;
    const scaleY = (rect.height * dpr) / this.virtualHeight;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = (this.canvas.width - this.virtualWidth * this.scale) / 2;
    this.offsetY = (this.canvas.height - this.virtualHeight * this.scale) / 2;
  }

  public setSkin(skin: BallSkin) {
    this.currentSkin = skin;
  }

  public setSettings(settings: GameSettings) {
    this.settings = settings;
  }

  public start() {
    this.resetState();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.setSoundEnabled(this.settings.soundEnabled);
    soundManager.setMusicEnabled(this.settings.musicEnabled);
    soundManager.setHapticsEnabled(this.settings.hapticsEnabled);

    // Initial warm-up wave
    this.spawnWave(-120);

    this.loop(performance.now());
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private resetState() {
    this.score = 0;
    this.coinsEarned = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.nearMissCount = 0;
    this.invulnerableTimer = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2.1;
    this.screenShake = 0;
    this.flashAlpha = 0;
    this.challengeBeatenAlerted = false;
    this.isDying = false;

    this.player.x = this.virtualWidth / 2;
    this.player.y = 560;
    this.player.direction = 1;
    this.player.vx = 320;
    this.player.scaleX = 1;
    this.player.scaleY = 1;

    this.obstacles = [];
    this.coins = [];
    this.powerUps = [];
    this.activePowerUps.clear();
    this.particles.clear();

    this.callbacks.onScoreUpdate(0);
    this.callbacks.onCoinUpdate(0);
    this.callbacks.onComboUpdate(0);
    this.callbacks.onPowerUpUpdate([]);
  }

  /**
   * Action trigger: User taps screen, clicks mouse, or hits spacebar
   */
  public handleAction() {
    if (!this.isRunning || this.isPaused) return;

    // Invert horizontal direction
    this.player.direction = this.player.direction === 1 ? -1 : 1;
    
    // Squash & stretch physics
    this.player.scaleX = 0.75;
    this.player.scaleY = 1.35;

    // Particle burst on direction switch
    this.particles.emitShockwave(this.player.x, this.player.y, this.currentSkin.glowColor);
    soundManager.playJump();
  }

  /**
   * Steer direction (for touch drag / keyboard arrow navigation)
   */
  public handleSteer(targetX: number) {
    if (!this.isRunning || this.isPaused) return;
    const clampedTarget = Math.max(30, Math.min(this.virtualWidth - 30, targetX));
    const dx = clampedTarget - this.player.x;
    if (Math.abs(dx) > 10) {
      this.player.direction = dx > 0 ? 1 : -1;
    }
  }

  public setDirection(dir: 1 | -1) {
    if (!this.isRunning || this.isPaused) return;
    if (this.player.direction !== dir) {
      this.handleAction();
    }
  }

  private spawnWave(customY?: number) {
    const spawnY = customY ?? -40;
    const wave = this.patternGen.generateWave(spawnY, this.score);

    this.obstacles.push(...wave.obstacles);
    this.coins.push(...wave.coins);
    this.powerUps.push(...wave.powerUps);
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.08); // Clamp to avoid tunnel glitches on lag spikes

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    if (this.isDying) {
      this.particles.update(dt);
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - dt * 25);
      }
      if (this.flashAlpha > 0) {
        this.flashAlpha = Math.max(0, this.flashAlpha - dt * 4);
      }
      return;
    }

    // Check slow-mo power-up
    const hasSlowMo = this.activePowerUps.has('slowmo');
    const timeScale = hasSlowMo ? 0.55 : 1.0;
    const effectiveDt = dt * timeScale;

    // Difficulty scaling
    const speedMultiplier = 1 + Math.min(this.score / 50, 1.4);
    const scrollSpeed = (230 + Math.min(this.score * 3.5, 220)) * effectiveDt;
    const playerSpeed = (330 + Math.min(this.score * 2.5, 120)) * effectiveDt;

    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Flash fade
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    }

    // Invulnerability decay
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }

    // Squash & stretch recovery
    this.player.scaleX += (1 - this.player.scaleX) * 12 * dt;
    this.player.scaleY += (1 - this.player.scaleY) * 12 * dt;

    // Combo timer decay
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.callbacks.onComboUpdate(0);
      }
    }

    // Active power-ups countdown
    let powerUpsChanged = false;
    for (const [type, data] of this.activePowerUps.entries()) {
      data.remaining -= dt;
      if (data.remaining <= 0) {
        this.activePowerUps.delete(type);
        powerUpsChanged = true;
      }
    }
    if (powerUpsChanged) {
      this.dispatchPowerUpUpdate();
    }

    // Move player horizontally
    this.player.x += this.player.direction * playerSpeed;

    // Arena boundary bounce
    const wallMargin = 28;
    if (this.player.x <= wallMargin) {
      this.player.x = wallMargin;
      this.player.direction = 1;
      this.particles.emitShockwave(this.player.x, this.player.y, this.currentSkin.glowColor);
      soundManager.playJump();
    } else if (this.player.x >= this.virtualWidth - wallMargin) {
      this.player.x = this.virtualWidth - wallMargin;
      this.player.direction = -1;
      this.particles.emitShockwave(this.player.x, this.player.y, this.currentSkin.glowColor);
      soundManager.playJump();
    }

    // Emit skin particle trail
    this.particles.emitTrail(
      this.player.x,
      this.player.y,
      this.currentSkin.trailColor,
      this.currentSkin.particleType
    );

    // Spawner progression
    this.spawnTimer += effectiveDt;
    this.spawnInterval = Math.max(1.2, 2.1 - this.score * 0.018);
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWave();
    }

    // Magnet power-up logic
    const hasMagnet = this.activePowerUps.has('magnet');
    const magnetRange = 320;

    // Update coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.y += scrollSpeed;
      coin.pulse += effectiveDt * 5;

      // Magnet pull
      if (hasMagnet && !coin.collected) {
        const dx = this.player.x - coin.x;
        const dy = this.player.y - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRange) {
          coin.x += (dx / dist) * 450 * effectiveDt;
          coin.y += (dy / dist) * 450 * effectiveDt;
        }
      }

      // Coin collection check
      const distToPlayer = Math.hypot(this.player.x - coin.x, this.player.y - coin.y);
      if (distToPlayer < this.player.radius + coin.radius + 6 && !coin.collected) {
        coin.collected = true;
        this.collectCoin(coin);
        this.coins.splice(i, 1);
        continue;
      }

      // Remove offscreen coins
      if (coin.y > this.virtualHeight + 50) {
        this.coins.splice(i, 1);
      }
    }

    // Update power-ups on track
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pow = this.powerUps[i];
      pow.y += scrollSpeed;
      pow.pulse += effectiveDt * 4;

      const dist = Math.hypot(this.player.x - pow.x, this.player.y - pow.y);
      if (dist < this.player.radius + pow.radius + 6 && !pow.collected) {
        pow.collected = true;
        this.collectPowerUp(pow);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (pow.y > this.virtualHeight + 50) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += scrollSpeed;

      // Obstacle internal motion
      if (obs.type === 'spinner') {
        obs.angle += obs.rotSpeed * effectiveDt;
      } else if (obs.vx !== 0) {
        obs.x += obs.vx * effectiveDt;
        // Bounce within arena
        if (obs.x <= 20 || obs.x + obs.width >= this.virtualWidth - 20) {
          obs.vx = -obs.vx;
        }
      }

      // Score point when passing player safely
      if (!obs.passed && obs.y > this.player.y + 15) {
        obs.passed = true;
        if (!obs.scored) {
          obs.scored = true;
          this.incrementScore(1);
        }
      }

      // Collision check (only if not invulnerable)
      if (this.invulnerableTimer <= 0) {
        const isColliding = this.checkCollision(obs);
        if (isColliding) {
          // If shield is active, absorb hit!
          if (this.activePowerUps.has('shield')) {
            this.activePowerUps.delete('shield');
            this.dispatchPowerUpUpdate();
            this.triggerScreenShake(12);
            this.triggerFlash('#00F0FF', 0.5);
            soundManager.playShieldBreak();
            this.invulnerableTimer = 1.2;
            this.particles.emitShockwave(this.player.x, this.player.y, '#00F0FF');
            this.particles.addFloatingText('SHIELD BROKEN!', this.player.x, this.player.y - 30, '#00F0FF', 16);
            // Destroy colliding obstacle
            this.obstacles.splice(i, 1);
            continue;
          } else {
            // Fatal crash
            this.handleDeath();
            return;
          }
        } else {
          // Near-miss detection
          if (!obs.nearMissed && Math.abs(obs.y - this.player.y) < 30) {
            const nearDistance = this.getNearMissDistance(obs);
            if (nearDistance > 0 && nearDistance <= 18) {
              obs.nearMissed = true;
              this.handleNearMiss();
            }
          }
        }
      }

      // Remove offscreen
      if (obs.y > this.virtualHeight + 80) {
        this.obstacles.splice(i, 1);
      }
    }

    // Check challenge progress
    if (this.challenge && !this.challengeBeatenAlerted && this.score > this.challenge.targetScore) {
      this.challengeBeatenAlerted = true;
      this.triggerFlash('#FFD700', 0.6);
      this.particles.addFloatingText('CHALLENGE BEATEN! 🎉', this.virtualWidth / 2, 280, '#FFD700', 22);
      soundManager.playPowerUp();
      if (this.callbacks.onChallengeBeaten) {
        this.callbacks.onChallengeBeaten();
      }
    }

    // Update particle physics
    this.particles.update(dt);
  }

  private incrementScore(points: number) {
    const has2x = this.activePowerUps.has('multiplier');
    const added = points * (has2x ? 2 : 1);
    this.score += added;
    this.callbacks.onScoreUpdate(this.score);
  }

  private collectCoin(coin: Coin) {
    this.combo++;
    this.comboTimer = 2.5; // 2.5s window to keep combo
    this.callbacks.onComboUpdate(this.combo);

    const has2x = this.activePowerUps.has('multiplier');
    const coinValue = coin.value * (has2x ? 2 : 1);
    this.coinsEarned += coinValue;
    this.callbacks.onCoinUpdate(this.coinsEarned);

    // Score boost
    this.incrementScore(2);

    this.particles.emitCoinBurst(coin.x, coin.y);
    soundManager.playCoin(this.combo);

    if (this.combo > 1 && this.combo % 3 === 0) {
      this.particles.addFloatingText(`${this.combo}X COMBO!`, coin.x, coin.y - 20, '#FFD700', 16);
    }
  }

  private collectPowerUp(pow: PowerUp) {
    this.activePowerUps.set(pow.type, {
      remaining: pow.duration,
      max: pow.duration
    });
    this.dispatchPowerUpUpdate();

    const titles: Record<PowerUpType, string> = {
      shield: 'SHIELD ACTIVE! 🛡️',
      magnet: 'COIN MAGNET! 🧲',
      slowmo: 'SLOW-MO MATRIX! ⏳',
      multiplier: '2X MULTIPLIER! ⚡'
    };

    const colors: Record<PowerUpType, string> = {
      shield: '#00F0FF',
      magnet: '#FF007F',
      slowmo: '#00FF66',
      multiplier: '#FFD700'
    };

    this.particles.emitShockwave(pow.x, pow.y, colors[pow.type]);
    this.particles.addFloatingText(titles[pow.type], this.player.x, this.player.y - 40, colors[pow.type], 18);
    soundManager.playPowerUp();
  }

  private dispatchPowerUpUpdate() {
    const list: ActivePowerUp[] = [];
    for (const [type, data] of this.activePowerUps.entries()) {
      list.push({
        type,
        remainingTime: Math.max(0, data.remaining),
        maxTime: data.max
      });
    }
    this.callbacks.onPowerUpUpdate(list);
  }

  private handleNearMiss() {
    this.nearMissCount++;
    this.incrementScore(3);
    this.coinsEarned += 1;
    this.callbacks.onCoinUpdate(this.coinsEarned);

    this.triggerScreenShake(4);
    soundManager.playNearMiss();
    this.particles.addFloatingText('NEAR MISS! +3', this.player.x, this.player.y - 30, '#00F0FF', 17);
    this.callbacks.onNearMiss(3);
  }

  private handleDeath() {
    if (this.isDying) return;
    this.isDying = true;
    soundManager.playCollision();
    this.triggerScreenShake(22);
    this.triggerFlash('#FF0055', 0.85);
    this.particles.emitExplosion(this.player.x, this.player.y, this.currentSkin.glowColor);

    // Fast & responsive game over trigger
    setTimeout(() => {
      this.isRunning = false;
      this.isDying = false;
      this.callbacks.onGameOver(this.score, this.coinsEarned, this.nearMissCount);
    }, 220);
  }

  private triggerScreenShake(magnitude: number) {
    this.screenShake = magnitude;
  }

  private triggerFlash(color: string, alpha: number) {
    this.flashColor = color;
    this.flashAlpha = alpha;
  }

  // Collision detection algorithms (Circle vs AABB & Circle vs OBB)
  private checkCollision(obs: Obstacle): boolean {
    const px = this.player.x;
    const py = this.player.y;
    const pr = this.player.hitboxRadius;

    if (obs.type === 'spinner') {
      // Circle vs Oriented Bounding Box (OBB)
      // Transform player into spinner local space
      const cos = Math.cos(-obs.angle);
      const sin = Math.sin(-obs.angle);
      const cx = obs.x;
      const cy = obs.y;

      const localX = cos * (px - cx) - sin * (py - cy);
      const localY = sin * (px - cx) + cos * (py - cy);

      const halfW = obs.width / 2;
      const halfH = obs.height / 2;

      const closestX = Math.max(-halfW, Math.min(halfW, localX));
      const closestY = Math.max(-halfH, Math.min(halfH, localY));

      const distX = localX - closestX;
      const distY = localY - closestY;
      return (distX * distX + distY * distY) < (pr * pr);
    } else if (obs.type === 'pulsing_orb' || obs.type === 'zigzag_blades') {
      // Circle vs Circle
      const orbRadius = obs.radius || obs.width / 2;
      const orbCenterX = obs.x + (obs.radius ? 0 : obs.width / 2);
      const orbCenterY = obs.y + (obs.radius ? 0 : obs.height / 2);
      const dist = Math.hypot(px - orbCenterX, py - orbCenterY);
      return dist < (pr + orbRadius * 0.85);
    } else {
      // Circle vs Axis-Aligned Bounding Box (AABB)
      const closestX = Math.max(obs.x, Math.min(px, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(py, obs.y + obs.height));

      const distX = px - closestX;
      const distY = py - closestY;
      return (distX * distX + distY * distY) < (pr * pr);
    }
  }

  private getNearMissDistance(obs: Obstacle): number {
    const px = this.player.x;
    const py = this.player.y;
    const pr = this.player.hitboxRadius;

    if (obs.type === 'spinner') {
      const cos = Math.cos(-obs.angle);
      const sin = Math.sin(-obs.angle);
      const localX = cos * (px - obs.x) - sin * (py - obs.y);
      const localY = sin * (px - obs.x) + cos * (py - obs.y);
      const closestX = Math.max(-obs.width / 2, Math.min(obs.width / 2, localX));
      const closestY = Math.max(-obs.height / 2, Math.min(obs.height / 2, localY));
      const dist = Math.hypot(localX - closestX, localY - closestY);
      return Math.max(0, dist - pr);
    } else {
      const closestX = Math.max(obs.x, Math.min(px, obs.x + obs.width));
      const closestY = Math.max(obs.y, Math.min(py, obs.y + obs.height));
      const dist = Math.hypot(px - closestX, py - closestY);
      return Math.max(0, dist - pr);
    }
  }

  // RENDER PIPELINE
  private render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply viewport scale & centering
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // Render Cyber Grid Arena Background
    this.renderArenaBackground();

    // Render Obstacles
    this.renderObstacles();

    // Render Coins & Power-Ups
    this.renderPickups();

    // Render Particle System
    this.particles.render(this.ctx);

    // Render Player
    if (this.isRunning) {
      this.renderPlayer();
    }

    // Screen Flash (on hit / powerup / challenge beat)
    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = this.flashColor;
      this.ctx.globalAlpha = this.flashAlpha;
      this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
      this.ctx.globalAlpha = 1;
    }

    this.ctx.restore();
  }

  private renderArenaBackground() {
    const ctx = this.ctx;
    
    // Deep dark arcade gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.virtualHeight);
    grad.addColorStop(0, '#0d0d1e');
    grad.addColorStop(0.5, '#070712');
    grad.addColorStop(1, '#05050d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

    // Cyber Neon Track boundaries (left & right rails)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(25, this.virtualHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.virtualWidth - 25, 0);
    ctx.lineTo(this.virtualWidth - 25, this.virtualHeight);
    ctx.stroke();

    // Subtle perspective grid lines moving downwards
    const gridY = (performance.now() * 0.15) % 60;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    for (let y = gridY; y < this.virtualHeight; y += 60) {
      ctx.beginPath();
      ctx.moveTo(25, y);
      ctx.lineTo(this.virtualWidth - 25, y);
      ctx.stroke();
    }
  }

  private renderObstacles() {
    const ctx = this.ctx;

    for (const obs of this.obstacles) {
      ctx.save();
      ctx.fillStyle = obs.color;
      ctx.shadowColor = obs.glowColor;
      ctx.shadowBlur = 14;

      if (obs.type === 'spinner') {
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.angle);
        
        // Rounded glowing beam
        ctx.beginPath();
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;
        ctx.roundRect(-halfW, -halfH, obs.width, obs.height, 8);
        ctx.fill();

        // Inner neon core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-halfW + 4, -halfH + 4, obs.width - 8, obs.height - 8, 4);
        ctx.fill();

        // Central pivot orb
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'pulsing_orb' || obs.type === 'zigzag_blades') {
        const radius = obs.radius || obs.width / 2;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sliding doors & horizontal bars
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();

        // Inner glowing core line
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(obs.x + 3, obs.y + 4, Math.max(0, obs.width - 6), Math.max(0, obs.height - 8));
      }

      ctx.restore();
    }
  }

  private renderPickups() {
    const ctx = this.ctx;

    // Render Coins
    for (const coin of this.coins) {
      ctx.save();
      const scale = 1 + Math.sin(coin.pulse) * 0.12;
      ctx.translate(coin.x, coin.y);
      ctx.scale(scale, scale);

      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 12;

      // Outer gold circle
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner sparkle diamond
      ctx.fillStyle = '#FFF8E1';
      ctx.beginPath();
      ctx.moveTo(0, -coin.radius * 0.6);
      ctx.lineTo(coin.radius * 0.6, 0);
      ctx.lineTo(0, coin.radius * 0.6);
      ctx.lineTo(-coin.radius * 0.6, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Render Power-Ups
    for (const pow of this.powerUps) {
      ctx.save();
      const scale = 1 + Math.sin(pow.pulse) * 0.15;
      ctx.translate(pow.x, pow.y);
      ctx.scale(scale, scale);

      const colors: Record<PowerUpType, { main: string; glow: string; icon: string }> = {
        shield: { main: '#00F0FF', glow: 'rgba(0, 240, 255, 0.9)', icon: '🛡️' },
        magnet: { main: '#FF007F', glow: 'rgba(255, 0, 127, 0.9)', icon: '🧲' },
        slowmo: { main: '#00FF66', glow: 'rgba(0, 255, 102, 0.9)', icon: '⏳' },
        multiplier: { main: '#FFD700', glow: 'rgba(255, 215, 0, 0.9)', icon: '2X' }
      };

      const style = colors[pow.type];
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 16;
      ctx.fillStyle = style.main;

      ctx.beginPath();
      ctx.arc(0, 0, pow.radius, 0, Math.PI * 2);
      ctx.fill();

      // Icon text
      ctx.fillStyle = '#080811';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.icon, 0, 1);

      ctx.restore();
    }
  }

  private renderPlayer() {
    const ctx = this.ctx;
    ctx.save();

    const p = this.player;
    ctx.translate(p.x, p.y);
    ctx.scale(p.scaleX, p.scaleY);

    // Shield Aura if active
    if (this.activePowerUps.has('shield')) {
      ctx.strokeStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fill();
    }

    // Magnet Aura if active
    if (this.activePowerUps.has('magnet')) {
      ctx.strokeStyle = '#FF007F';
      ctx.shadowColor = '#FF007F';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer Glow
    ctx.shadowColor = this.currentSkin.glowColor;
    ctx.shadowBlur = 22;

    // Ball Base Color
    ctx.fillStyle = this.currentSkin.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner Radiant Core
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-3, -3, p.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

