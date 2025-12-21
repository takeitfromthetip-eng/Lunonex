import { CGIEffect } from './CGIEffect';

/**
 * Particle system base class
 */
class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(deltaTime) {
    const dt = deltaTime / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = `${this.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Snow effect
 */
export class SnowEffect extends CGIEffect {
  constructor() {
    super('Snow', {
      params: {
        particleCount: 100,
        speed: 50,
        wind: 0
      }
    });
    
    this.particles = [];
  }

  apply(imageData, ctx, deltaTime) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Add new particles
    while (this.particles.length < this.params.particleCount) {
      this.particles.push(new Particle(
        Math.random() * width,
        -10,
        this.params.wind,
        this.params.speed + Math.random() * 20,
        5 + Math.random() * 5,
        '#ffffff',
        2 + Math.random() * 3
      ));
    }

    // Update and draw particles
    this.particles = this.particles.filter(p => {
      const alive = p.update(deltaTime);
      if (p.y < height && alive) {
        p.draw(ctx);
        return true;
      }
      return false;
    });

    return imageData;
  }

  setParticleCount(count) {
    this.params.particleCount = Math.max(10, Math.min(500, count));
  }

  setSpeed(speed) {
    this.params.speed = Math.max(10, Math.min(200, speed));
  }

  setWind(wind) {
    this.params.wind = Math.max(-50, Math.min(50, wind));
  }
}

/**
 * Rain effect
 */
export class RainEffect extends CGIEffect {
  constructor() {
    super('Rain', {
      params: {
        intensity: 100,
        speed: 300,
        angle: 0
      }
    });
    
    this.drops = [];
  }

  apply(imageData, ctx, deltaTime) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Add new drops
    while (this.drops.length < this.params.intensity) {
      const angleRad = (this.params.angle * Math.PI) / 180;
      this.drops.push({
        x: Math.random() * width,
        y: -10,
        vx: Math.sin(angleRad) * this.params.speed,
        vy: Math.cos(angleRad) * this.params.speed,
        length: 10 + Math.random() * 20
      });
    }

    // Update and draw drops
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    ctx.lineWidth = 1;

    this.drops = this.drops.filter(drop => {
      const dt = deltaTime / 1000;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;

      if (drop.y < height) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.vx * 0.02, drop.y - drop.vy * 0.02);
        ctx.stroke();
        return true;
      }
      return false;
    });

    return imageData;
  }

  setIntensity(intensity) {
    this.params.intensity = Math.max(10, Math.min(300, intensity));
  }

  setSpeed(speed) {
    this.params.speed = Math.max(100, Math.min(1000, speed));
  }

  setAngle(angle) {
    this.params.angle = Math.max(-45, Math.min(45, angle));
  }
}

/**
 * Confetti effect
 */
export class ConfettiEffect extends CGIEffect {
  constructor() {
    super('Confetti', {
      params: {
        particleCount: 50,
        gravity: 100
      }
    });
    
    this.confetti = [];
    this.colors = ['#ff0066', '#00ff88', '#0066ff', '#ffff00', '#ff6600', '#ff00ff'];
  }

  apply(imageData, ctx, deltaTime) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Add new confetti
    while (this.confetti.length < this.params.particleCount) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.confetti.push({
        x: Math.random() * width,
        y: -20,
        vx: (Math.random() - 0.5) * 100,
        vy: Math.random() * 50 + 50,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 360,
        color: color,
        size: 5 + Math.random() * 5
      });
    }

    // Update and draw confetti
    const dt = deltaTime / 1000;
    
    this.confetti = this.confetti.filter(conf => {
      conf.x += conf.vx * dt;
      conf.y += conf.vy * dt;
      conf.vy += this.params.gravity * dt;
      conf.rotation += conf.rotationSpeed * dt;

      if (conf.y < height + 50) {
        ctx.save();
        ctx.translate(conf.x, conf.y);
        ctx.rotate((conf.rotation * Math.PI) / 180);
        ctx.fillStyle = conf.color;
        ctx.fillRect(-conf.size / 2, -conf.size / 2, conf.size, conf.size * 2);
        ctx.restore();
        return true;
      }
      return false;
    });

    return imageData;
  }

  setParticleCount(count) {
    this.params.particleCount = Math.max(10, Math.min(200, count));
  }

  setGravity(gravity) {
    this.params.gravity = Math.max(0, Math.min(500, gravity));
  }

  burst(x, y, count = 30) {
    const width = count;
    for (let i = 0; i < width; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 100 + Math.random() * 200;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      
      this.confetti.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 360,
        color: color,
        size: 5 + Math.random() * 5
      });
    }
  }
}

/**
 * Fireflies effect
 */
export class FirefliesEffect extends CGIEffect {
  constructor() {
    super('Fireflies', {
      params: {
        count: 30,
        speed: 30,
        glowSize: 15
      }
    });
    
    this.fireflies = [];
  }

  apply(imageData, ctx, deltaTime) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Initialize fireflies
    while (this.fireflies.length < this.params.count) {
      this.fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * this.params.speed,
        vy: (Math.random() - 0.5) * this.params.speed,
        brightness: Math.random(),
        brightnessDirection: 1
      });
    }

    // Update and draw fireflies
    const dt = deltaTime / 1000;
    
    this.fireflies.forEach(fly => {
      // Update position
      fly.x += fly.vx * dt;
      fly.y += fly.vy * dt;

      // Bounce off edges
      if (fly.x < 0 || fly.x > width) fly.vx *= -1;
      if (fly.y < 0 || fly.y > height) fly.vy *= -1;

      // Update brightness (pulsing)
      fly.brightness += fly.brightnessDirection * dt * 2;
      if (fly.brightness > 1) {
        fly.brightness = 1;
        fly.brightnessDirection = -1;
      } else if (fly.brightness < 0) {
        fly.brightness = 0;
        fly.brightnessDirection = 1;
      }

      // Draw glow
      const gradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, this.params.glowSize);
      gradient.addColorStop(0, `rgba(255, 255, 100, ${fly.brightness * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 100, ${fly.brightness * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        fly.x - this.params.glowSize,
        fly.y - this.params.glowSize,
        this.params.glowSize * 2,
        this.params.glowSize * 2
      );
    });

    return imageData;
  }

  setCount(count) {
    this.params.count = Math.max(5, Math.min(100, count));
    // Adjust fireflies array
    while (this.fireflies.length > this.params.count) {
      this.fireflies.pop();
    }
  }

  setSpeed(speed) {
    this.params.speed = Math.max(10, Math.min(100, speed));
  }

  setGlowSize(size) {
    this.params.glowSize = Math.max(5, Math.min(50, size));
  }
}

/**
 * Sparkles effect
 */
export class SparklesEffect extends CGIEffect {
  constructor() {
    super('Sparkles', {
      params: {
        density: 20,
        size: 3,
        color: '#ffffff'
      }
    });
    
    this.sparkles = [];
  }

  apply(imageData, ctx, deltaTime) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Add new sparkles
    if (Math.random() < this.params.density / 100) {
      this.sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: this.params.size,
        opacity: 1,
        fadeSpeed: 1 + Math.random()
      });
    }

    // Update and draw sparkles
    const dt = deltaTime / 1000;
    
    this.sparkles = this.sparkles.filter(sparkle => {
      sparkle.opacity -= sparkle.fadeSpeed * dt;

      if (sparkle.opacity > 0) {
        ctx.save();
        ctx.fillStyle = `${this.params.color}${Math.floor(sparkle.opacity * 255).toString(16).padStart(2, '0')}`;
        
        // Draw 4-pointed star
        ctx.translate(sparkle.x, sparkle.y);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(0, sparkle.size);
          ctx.lineTo(0, sparkle.size / 3);
          ctx.rotate(Math.PI / 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        return true;
      }
      return false;
    });

    return imageData;
  }

  setDensity(density) {
    this.params.density = Math.max(1, Math.min(100, density));
  }

  setSize(size) {
    this.params.size = Math.max(2, Math.min(20, size));
  }

  setColor(color) {
    this.params.color = color;
  }
}

export default SnowEffect;
