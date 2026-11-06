// Confeti 2D en canvas: ligero, con pausa automática cuando no hay partículas.
const COLORS = ['#FFCE5C', '#6FE3C1', '#FF9FB0', '#8FB8FF', '#C9A7FF', '#FFF6E4', '#6FD3FF'];

export class Confetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.parts = [];
    this.raf = 0;
    this.last = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  burst(count = 140, origin = { x: 0.5, y: 0.3 }) {
    const ox = window.innerWidth * origin.x;
    const oy = window.innerHeight * origin.y;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.parts.push({
        x: ox,
        y: oy,
        vx: Math.cos(a) * speed * (0.6 + Math.random() * 0.8),
        vy: Math.sin(a) * speed - 3 - Math.random() * 4,
        w: 5 + Math.random() * 8,
        h: 7 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
        decay: 0.004 + Math.random() * 0.006,
        ribbon: Math.random() > 0.55,
      });
    }
    this.start();
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(48, now - this.last) / 16.67;
      this.last = now;
      this.step(dt);
      if (this.parts.length) {
        this.raf = requestAnimationFrame(loop);
      } else {
        this.raf = 0;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  step(dt) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    const alive = [];
    for (const p of this.parts) {
      p.vy += 0.22 * dt;
      p.vx *= 0.992;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0 || p.y > window.innerHeight + 60) continue;
      alive.push(p);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.fillStyle = p.color;
      if (p.ribbon) {
        ctx.beginPath();
        ctx.moveTo(-p.w / 2, -p.h / 2);
        ctx.quadraticCurveTo(p.w / 2, 0, -p.w / 2, p.h / 2);
        ctx.quadraticCurveTo(p.w / 4, 0, -p.w / 2, -p.h / 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.5 + Math.abs(Math.cos(p.rot)) * 0.5));
      }
      ctx.restore();
    }
    this.parts = alive;
    ctx.restore();
  }

  clear() {
    this.parts = [];
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
