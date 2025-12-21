import { CGIEffect } from './CGIEffect';

/**
 * Animated Text Overlay Effect
 */
export class TextOverlayEffect extends CGIEffect {
  constructor(options) {
    super('textoverlay', {
      params: {
        text: 'Hello World',
        x: 50, // percentage
        y: 50, // percentage
        fontSize: 48,
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        outline: true,
        outlineColor: '#000000',
        outlineWidth: 3,
        animation: 'none', // 'none', 'fade', 'bounce', 'typewriter'
        animationDuration: 2000,
        shadow: true
      },
      ...options
    });

    this.startTime = Date.now();
    this.typewriterIndex = 0;
  }

  _process(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;
    const params = this.params;
    const elapsed = Date.now() - this.startTime;

    // Calculate position (percentage to pixels)
    const x = (params.x / 100) * width;
    const y = (params.y / 100) * height;

    // Calculate animation progress
    const progress = Math.min(1, elapsed / params.animationDuration);

    // Apply animation
    let displayText = params.text;
    let alpha = 1;
    let offsetY = 0;

    switch (params.animation) {
      case 'fade':
        alpha = progress;
        break;
      case 'bounce':
        offsetY = Math.sin(elapsed / 200) * 10;
        break;
      case 'typewriter':
        this.typewriterIndex = Math.floor(progress * params.text.length);
        displayText = params.text.substring(0, this.typewriterIndex);
        break;
    }

    // Set font
    ctx.font = `${params.fontSize}px ${params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha * this.intensity;

    // Draw shadow
    if (params.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }

    // Draw outline
    if (params.outline) {
      ctx.strokeStyle = params.outlineColor;
      ctx.lineWidth = params.outlineWidth;
      ctx.strokeText(displayText, x, y + offsetY);
    }

    // Draw text
    ctx.fillStyle = params.color;
    ctx.fillText(displayText, x, y + offsetY);

    // Reset
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    return imageData;
  }
}

/**
 * Lower Third Text (name badge for streams)
 */
export class LowerThirdEffect extends CGIEffect {
  constructor(options) {
    super('lowerthird', {
      params: {
        name: 'John Doe',
        title: 'Super Admin',
        backgroundColor: 'rgba(102, 126, 234, 0.9)',
        textColor: '#ffffff',
        position: 'bottom-left', // 'bottom-left', 'bottom-right', 'bottom-center'
        padding: 20
      },
      ...options
    });
  }

  _process(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;
    const params = this.params;

    // Calculate dimensions
    const boxHeight = 80;
    const boxWidth = 300;
    let x, y;

    switch (params.position) {
      case 'bottom-left':
        x = params.padding;
        y = height - boxHeight - params.padding;
        break;
      case 'bottom-right':
        x = width - boxWidth - params.padding;
        y = height - boxHeight - params.padding;
        break;
      case 'bottom-center':
        x = (width - boxWidth) / 2;
        y = height - boxHeight - params.padding;
        break;
      default:
        x = params.padding;
        y = height - boxHeight - params.padding;
    }

    // Draw background box
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Draw name
    ctx.fillStyle = params.textColor;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(params.name, x + 15, y + 30);

    // Draw title
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(params.title, x + 15, y + 55);

    return imageData;
  }
}

/**
 * Subtitles / Captions Effect
 */
export class SubtitlesEffect extends CGIEffect {
  constructor(options) {
    super('subtitles', {
      params: {
        text: '',
        fontSize: 32,
        backgroundColor: 'rgba(0,0,0,0.8)',
        textColor: '#ffffff',
        maxWidth: 80, // percentage
        padding: 15
      },
      ...options
    });
  }

  _process(imageData, ctx) {
    if (!this.params.text) return imageData;

    const width = imageData.width;
    const height = imageData.height;
    const params = this.params;

    // Calculate text dimensions
    ctx.font = `${params.fontSize}px Arial, sans-serif`;
    const maxWidth = (params.maxWidth / 100) * width;
    const lines = this.wrapText(ctx, params.text, maxWidth);

    const lineHeight = params.fontSize * 1.2;
    const boxHeight = lines.length * lineHeight + params.padding * 2;
    const boxWidth = Math.min(maxWidth + params.padding * 2, width);

    // Position at bottom center
    const x = (width - boxWidth) / 2;
    const y = height - boxHeight - 40;

    // Draw background
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Draw text
    ctx.fillStyle = params.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, y + params.padding + i * lineHeight);
    });

    return imageData;
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    return lines;
  }

  /**
   * Update subtitle text
   */
  updateText(text) {
    this.params.text = text;
  }
}

/**
 * Emoji Reaction Effect
 */
export class EmojiReactionEffect extends CGIEffect {
  constructor(options) {
    super('emojireaction', {
      params: {
        emoji: '❤️',
        duration: 3000,
        size: 60
      },
      ...options
    });

    this.particles = [];
  }

  trigger(emoji = this.params.emoji) {
    // Create particle
    this.particles.push({
      emoji,
      x: Math.random() * 100, // percentage
      y: 100,
      velocity: -2 - Math.random() * 2,
      rotation: Math.random() * 360,
      rotationSpeed: -5 + Math.random() * 10,
      opacity: 1,
      scale: 0.5 + Math.random() * 0.5,
      startTime: Date.now()
    });
  }

  _process(imageData, ctx) {
    const width = imageData.width;
    const height = imageData.height;
    const now = Date.now();

    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      const age = now - particle.startTime;
      if (age > this.params.duration) return false;

      // Update position
      particle.y += particle.velocity;
      particle.rotation += particle.rotationSpeed;
      particle.opacity = 1 - (age / this.params.duration);

      // Draw emoji
      const x = (particle.x / 100) * width;
      const y = (particle.y / 100) * height;

      ctx.save();
      ctx.globalAlpha = particle.opacity * this.intensity;
      ctx.translate(x, y);
      ctx.rotate(particle.rotation * Math.PI / 180);
      ctx.font = `${this.params.size * particle.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(particle.emoji, 0, 0);
      ctx.restore();

      return true;
    });

    return imageData;
  }
}
