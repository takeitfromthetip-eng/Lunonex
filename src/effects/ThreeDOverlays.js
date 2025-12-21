/* eslint-disable */
import { CGIEffect } from './CGIEffect';
// three.js removed

/**
 * Base class for Three.js effects
 */
class ThreeJSEffect extends CGIEffect {
  constructor(name, options) {
    super(name, options);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.threeCanvas = null;
  }

  initThreeJS(canvas) {
    if (this.scene) return;

    this.threeCanvas = document.createElement('canvas');
    this.threeCanvas.width = canvas.width;
    this.threeCanvas.height = canvas.height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setClearColor(0x000000, 0);
  }

  cleanup() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }
}

/**
 * Floating 3D cubes effect
 */
export class FloatingCubesEffect extends ThreeJSEffect {
  constructor() {
    super('Floating Cubes', {
      params: {
        count: 20,
        size: 0.5,
        speed: 1,
        color: '#4a90ff'
      }
    });
    this.cubes = [];
  }

  apply(imageData, ctx, deltaTime) {
    this.initThreeJS(ctx.canvas);

    // Initialize cubes
    if (this.cubes.length === 0) {
      for (let i = 0; i < this.params.count; i++) {
        const geometry = new THREE.BoxGeometry(
          this.params.size,
          this.params.size,
          this.params.size
        );
        const material = new THREE.MeshBasicMaterial({
          color: this.params.color,
          transparent: true,
          opacity: 0.7
        });
        const cube = new THREE.Mesh(geometry, material);

        // Random position
        cube.position.x = (Math.random() - 0.5) * 10;
        cube.position.y = (Math.random() - 0.5) * 10;
        cube.position.z = (Math.random() - 0.5) * 10;

        // Random velocity
        cube.userData.velocity = {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        };

        this.scene.add(cube);
        this.cubes.push(cube);
      }
    }

    // Animate cubes
    this.cubes.forEach(cube => {
      cube.rotation.x += 0.01 * this.params.speed;
      cube.rotation.y += 0.01 * this.params.speed;

      cube.position.x += cube.userData.velocity.x * this.params.speed;
      cube.position.y += cube.userData.velocity.y * this.params.speed;
      cube.position.z += cube.userData.velocity.z * this.params.speed;

      // Wrap around
      if (Math.abs(cube.position.x) > 5) cube.userData.velocity.x *= -1;
      if (Math.abs(cube.position.y) > 5) cube.userData.velocity.y *= -1;
      if (Math.abs(cube.position.z) > 5) cube.userData.velocity.z *= -1;
    });

    // Render Three.js scene
    this.renderer.render(this.scene, this.camera);

    // Composite over video
    ctx.globalAlpha = this.intensity;
    ctx.drawImage(this.threeCanvas, 0, 0);
    ctx.globalAlpha = 1;

    return imageData;
  }
}

/**
 * Particle explosion effect
 */
export class ParticleExplosionEffect extends ThreeJSEffect {
  constructor() {
    super('Particle Explosion', {
      params: {
        particleCount: 1000,
        explosionRadius: 5,
        color: '#ff6b6b',
        duration: 2000
      }
    });
    this.particles = null;
    this.isExploding = false;
    this.explosionTime = 0;
  }

  trigger() {
    this.isExploding = true;
    this.explosionTime = 0;
  }

  apply(imageData, ctx, deltaTime) {
    this.initThreeJS(ctx.canvas);

    // Initialize particle system
    if (!this.particles) {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const velocities = [];

      for (let i = 0; i < this.params.particleCount; i++) {
        positions.push(0, 0, 0);
        
        // Random velocity
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = Math.random() * 0.1;
        
        velocities.push(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

      const material = new THREE.PointsMaterial({
        color: this.params.color,
        size: 0.1,
        transparent: true,
        opacity: 0.8
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    }

    // Update explosion
    if (this.isExploding) {
      this.explosionTime += deltaTime;

      const positions = this.particles.geometry.attributes.position.array;
      const velocities = this.particles.geometry.attributes.velocity.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Apply gravity
        velocities[i + 1] -= 0.001;
      }

      this.particles.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const progress = this.explosionTime / this.params.duration;
      this.particles.material.opacity = Math.max(0, 1 - progress);

      // Reset explosion
      if (this.explosionTime >= this.params.duration) {
        this.isExploding = false;
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i++) {
          positions[i] = 0;
        }
        this.particles.material.opacity = 0.8;
      }
    }

    // Render
    this.renderer.render(this.scene, this.camera);
    ctx.globalAlpha = this.intensity;
    ctx.drawImage(this.threeCanvas, 0, 0);
    ctx.globalAlpha = 1;

    return imageData;
  }
}

/**
 * Glowing ring effect
 */
export class GlowingRingEffect extends ThreeJSEffect {
  constructor() {
    super('Glowing Ring', {
      params: {
        radius: 2,
        thickness: 0.2,
        color: '#00ffff',
        rotationSpeed: 1
      }
    });
    this.ring = null;
  }

  apply(imageData, ctx, deltaTime) {
    this.initThreeJS(ctx.canvas);

    if (!this.ring) {
      const geometry = new THREE.TorusGeometry(
        this.params.radius,
        this.params.thickness,
        16,
        100
      );
      const material = new THREE.MeshBasicMaterial({
        color: this.params.color,
        transparent: true,
        opacity: 0.6
      });
      this.ring = new THREE.Mesh(geometry, material);
      this.scene.add(this.ring);
    }

    // Rotate ring
    this.ring.rotation.x += 0.01 * this.params.rotationSpeed;
    this.ring.rotation.y += 0.02 * this.params.rotationSpeed;

    // Pulsating effect
    const scale = 1 + Math.sin(Date.now() / 500) * 0.1;
    this.ring.scale.set(scale, scale, scale);

    // Render
    this.renderer.render(this.scene, this.camera);
    ctx.globalAlpha = this.intensity;
    ctx.drawImage(this.threeCanvas, 0, 0);
    ctx.globalAlpha = 1;

    return imageData;
  }
}

/**
 * Floating hearts effect
 */
export class FloatingHeartsEffect extends ThreeJSEffect {
  constructor() {
    super('Floating Hearts', {
      params: {
        count: 15,
        speed: 0.02,
        color: '#ff69b4'
      }
    });
    this.hearts = [];
  }

  apply(imageData, ctx, deltaTime) {
    // Draw hearts on 2D canvas (simpler than 3D)
    ctx.save();

    if (this.hearts.length === 0) {
      for (let i = 0; i < this.params.count; i++) {
        this.hearts.push({
          x: Math.random() * ctx.canvas.width,
          y: ctx.canvas.height + Math.random() * 200,
          size: 20 + Math.random() * 30,
          speed: this.params.speed + Math.random() * 0.02,
          wobble: Math.random() * Math.PI * 2
        });
      }
    }

    // Draw and update hearts
    this.hearts.forEach(heart => {
      heart.y -= heart.speed * deltaTime;
      heart.wobble += 0.05;
      
      const wobbleX = Math.sin(heart.wobble) * 10;

      // Reset if off screen
      if (heart.y < -100) {
        heart.y = ctx.canvas.height + 50;
        heart.x = Math.random() * ctx.canvas.width;
      }

      // Draw heart shape
      ctx.globalAlpha = this.intensity * 0.8;
      ctx.fillStyle = this.params.color;
      this.drawHeart(ctx, heart.x + wobbleX, heart.y, heart.size);
    });

    ctx.restore();
    return imageData;
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    
    // Top left curve
    ctx.bezierCurveTo(
      x, y,
      x - size / 2, y,
      x - size / 2, y + topCurveHeight
    );
    
    // Bottom left curve
    ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2,
      x, y + (size + topCurveHeight) / 2,
      x, y + size
    );
    
    // Bottom right curve
    ctx.bezierCurveTo(
      x, y + (size + topCurveHeight) / 2,
      x + size / 2, y + (size + topCurveHeight) / 2,
      x + size / 2, y + topCurveHeight
    );
    
    // Top right curve
    ctx.bezierCurveTo(
      x + size / 2, y,
      x, y,
      x, y + topCurveHeight
    );
    
    ctx.closePath();
    ctx.fill();
  }
}

export default FloatingCubesEffect;
