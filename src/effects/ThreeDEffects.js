/* eslint-disable */
import { CGIEffect } from './CGIEffect';
// three.js removed

/**
 * Base class for Three.js effects
 */
class ThreeJSEffect extends CGIEffect {
  constructor(name, options) {
    super(name, options);

    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    this.camera.position.z = 5;

    // Create renderer (will render to texture)
    this.renderer = null;
    this.renderTarget = null;
  }

  setupRenderer(width, height) {
    if (!this.renderer) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });

      this.renderer.setSize(width, height);
      this.renderer.setClearColor(0x000000, 0); // Transparent
    }
  }

  _process(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;

    this.setupRenderer(width, height);

    // Update Three.js scene
    this.updateScene();

    // Render Three.js scene
    this.renderer.render(this.scene, this.camera);

    // Composite Three.js output over video
    ctx.drawImage(this.renderer.domElement, 0, 0, width, height);

    return ctx.getImageData(0, 0, width, height);
  }

  updateScene() {
    // Override in child classes
  }
}

/**
 * Floating 3D Cube Effect
 */
export class FloatingCubeEffect extends ThreeJSEffect {
  constructor(options) {
    super('floatingcube', options);

    // Create cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x667eea,
      emissive: 0x667eea,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });

    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    this.time = 0;
  }

  updateScene() {
    this.time += 0.01;

    // Rotate cube
    this.cube.rotation.x = this.time;
    this.cube.rotation.y = this.time * 1.5;

    // Float up and down
    this.cube.position.y = Math.sin(this.time * 2) * 0.5;
  }
}

/**
 * Particle Explosion Effect
 */
export class ParticleExplosionEffect extends ThreeJSEffect {
  constructor(options) {
    super('particleexplosion', {
      params: {
        particleCount: 500,
        color: 0xff6b6b,
        size: 0.05
      },
      ...options
    });

    this.particles = [];
    this.isExploding = false;
    this.explosionTime = 0;
  }

  trigger(x = 0, y = 0) {
    // Clear old particles
    this.particles.forEach(p => this.scene.remove(p));
    this.particles = [];

    // Create new particles
    const geometry = new THREE.SphereGeometry(this.params.size, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: this.params.color,
      transparent: true
    });

    for (let i = 0; i < this.params.particleCount; i++) {
      const particle = new THREE.Mesh(geometry, material.clone());

      // Random direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.1 + Math.random() * 0.2;

      particle.velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      particle.position.set(x, y, 0);
      particle.userData.life = 1.0;

      this.scene.add(particle);
      this.particles.push(particle);
    }

    this.isExploding = true;
    this.explosionTime = 0;
  }

  updateScene() {
    if (!this.isExploding) return;

    this.explosionTime += 0.016; // ~60fps

    this.particles.forEach(particle => {
      // Update position
      particle.position.add(particle.velocity);

      // Apply gravity
      particle.velocity.y -= 0.01;

      // Fade out
      particle.userData.life -= 0.01;
      particle.material.opacity = particle.userData.life * this.intensity;

      // Remove if dead
      if (particle.userData.life <= 0) {
        this.scene.remove(particle);
      }
    });

    // Clean up dead particles
    this.particles = this.particles.filter(p => p.userData.life > 0);

    if (this.particles.length === 0) {
      this.isExploding = false;
    }
  }
}

/**
 * Glowing Ring Effect
 */
export class GlowingRingEffect extends ThreeJSEffect {
  constructor(options) {
    super('glowingring', {
      params: {
        color: 0x00ffff,
        radius: 1.5,
        thickness: 0.1
      },
      ...options
    });

    const geometry = new THREE.TorusGeometry(
      this.params.radius,
      this.params.thickness,
      16,
      100
    );

    const material = new THREE.MeshBasicMaterial({
      color: this.params.color,
      transparent: true,
      opacity: 0.7
    });

    this.ring = new THREE.Mesh(geometry, material);
    this.scene.add(this.ring);

    this.time = 0;
  }

  updateScene() {
    this.time += 0.02;

    // Rotate ring
    this.ring.rotation.x = Math.PI / 4;
    this.ring.rotation.z = this.time;

    // Pulse effect
    const scale = 1 + Math.sin(this.time * 3) * 0.1;
    this.ring.scale.set(scale, scale, scale);

    // Glow effect
    this.ring.material.opacity = (0.5 + Math.sin(this.time * 2) * 0.2) * this.intensity;
  }
}

/**
 * Floating Hearts Effect
 */
export class FloatingHeartsEffect extends ThreeJSEffect {
  constructor(options) {
    super('floatinghearts', {
      params: {
        heartCount: 20,
        spawnRate: 0.1
      },
      ...options
    });

    this.hearts = [];
    this.spawnTimer = 0;
  }

  updateScene() {
    this.spawnTimer += 0.016;

    // Spawn new hearts
    if (this.spawnTimer > this.params.spawnRate && this.hearts.length < this.params.heartCount) {
      this.spawnHeart();
      this.spawnTimer = 0;
    }

    // Update existing hearts
    this.hearts.forEach(heart => {
      // Float upward
      heart.position.y += 0.02;

      // Slight wave motion
      heart.position.x += Math.sin(heart.userData.time) * 0.01;
      heart.userData.time += 0.1;

      // Fade out at top
      if (heart.position.y > 4) {
        heart.material.opacity -= 0.02;
      }

      // Remove if fully faded
      if (heart.material.opacity <= 0 || heart.position.y > 6) {
        this.scene.remove(heart);
      }
    });

    // Clean up removed hearts
    this.hearts = this.hearts.filter(h => h.parent === this.scene);
  }

  spawnHeart() {
    // Create heart shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    shape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
    shape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
    shape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const heart = new THREE.Mesh(geometry, material);

    // Random starting position
    heart.position.set(
      -2 + Math.random() * 4,
      -4,
      -1 + Math.random() * 2
    );

    heart.scale.set(0.3, 0.3, 0.3);
    heart.userData.time = Math.random() * Math.PI * 2;

    this.scene.add(heart);
    this.hearts.push(heart);
  }
}

/**
 * Spinning Stars Effect
 */
export class SpinningStarsEffect extends ThreeJSEffect {
  constructor(options) {
    super('spinningstars', {
      params: {
        starCount: 50,
        radius: 3
      },
      ...options
    });

    this.createStars();
  }

  createStars() {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true
    });

    for (let i = 0; i < this.params.starCount; i++) {
      const star = new THREE.Mesh(geometry, material.clone());

      // Position in circle
      const angle = (i / this.params.starCount) * Math.PI * 2;
      star.position.set(
        Math.cos(angle) * this.params.radius,
        Math.sin(angle) * this.params.radius,
        (Math.random() - 0.5) * 2
      );

      star.userData.angle = angle;
      star.userData.speed = 0.01 + Math.random() * 0.01;

      this.scene.add(star);
    }
  }

  updateScene() {
    this.scene.children.forEach(star => {
      if (star.userData.angle !== undefined) {
        star.userData.angle += star.userData.speed;

        star.position.x = Math.cos(star.userData.angle) * this.params.radius;
        star.position.y = Math.sin(star.userData.angle) * this.params.radius;

        // Twinkle effect
        star.material.opacity = (0.5 + Math.sin(star.userData.angle * 5) * 0.5) * this.intensity;
      }
    });
  }
}
