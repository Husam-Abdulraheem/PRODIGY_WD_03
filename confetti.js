/**
 * Lightweight Canvas Confetti Generator
 * High-performance, zero-dependency particle engine
 */

export class ConfettiCannon {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isActive = false;

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(durationMs = 2400) {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.resize();
    this.particles = [];
    this.isActive = true;

    const colors = ['#00f5d4', '#7b2cbf', '#ff007f', '#fee440', '#00bbf9', '#ff9f1c'];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 12));

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() * 80 - 40),
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -(Math.random() * 12 + 6),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = elapsed / durationMs;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - progress);

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      if (progress < 1 && this.isActive) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.stop();
      }
    };

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animationId = requestAnimationFrame(animate);
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
  }
}
