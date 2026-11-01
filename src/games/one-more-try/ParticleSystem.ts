export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'circle' | 'spark' | 'ring' | 'star' | 'matrix';
  rotation?: number;
  rotSpeed?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  fontSize: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 1.4;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'spark' && p.rotation !== undefined) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.radius, -p.radius * 0.3, p.radius * 2, p.radius * 0.6);
        ctx.restore();
      } else if (p.type === 'matrix') {
        ctx.font = `${Math.floor(p.radius * 2.5)}px monospace`;
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render floating texts (Near Miss, Multipliers, etc.)
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
      ctx.font = `900 ${ft.fontSize}px 'Orbitron', 'Outfit', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  public emitTrail(
    x: number,
    y: number,
    color: string,
    particleType: 'plasma' | 'fire' | 'star' | 'matrix' | 'neon' | 'gold' | 'void'
  ) {
    const pType: Particle['type'] = 
      particleType === 'matrix' ? 'matrix' : 
      particleType === 'star' || particleType === 'gold' ? 'spark' : 'circle';

    const count = particleType === 'fire' ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      const vy = particleType === 'fire' ? -(Math.random() * 40 + 20) : (Math.random() - 0.5) * 20;

      this.particles.push({
        x: x + offsetX,
        y: y + offsetY,
        vx: (Math.random() - 0.5) * 30,
        vy: vy,
        radius: Math.random() * 3 + 2,
        color: color,
        alpha: 0.7,
        decay: 1.8,
        type: pType,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 6
      });
    }
  }

  public emitCoinBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 120 + 70;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 2,
        color: '#FFD700',
        alpha: 1,
        decay: 1.5,
        type: 'spark',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
  }

  public emitShockwave(x: number, y: number, color: string = '#00F0FF') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 12,
      color: color,
      alpha: 1,
      decay: 1.6,
      type: 'ring'
    });
  }

  public emitExplosion(x: number, y: number, color: string) {
    // Big shockwave
    this.emitShockwave(x, y, color);

    // Particle cloud
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 5 + 2,
        color: Math.random() > 0.4 ? color : '#FFFFFF',
        alpha: 1,
        decay: Math.random() * 0.8 + 0.8,
        type: Math.random() > 0.5 ? 'spark' : 'circle',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#00F0FF', fontSize: number = 18) {
    this.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      vy: -60,
      alpha: 1,
      color,
      fontSize
    });
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}

