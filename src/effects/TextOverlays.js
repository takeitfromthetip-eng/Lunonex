import { CGIEffect } from './CGIEffect';

/**
 * Animated text overlays and subtitles
 */
export class TextOverlayEffect extends CGIEffect {
  constructor() {
    super('Text Overlay', {
      params: {
        text: '',
        x: 50,
        y: 50,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 3,
        animation: 'none', // none, fade, slide, bounce
        animationProgress: 0
      }
    });
  }

  apply(imageData, ctx, deltaTime) {
    if (!this.params.text) return imageData;

    // Save context state
    ctx.save();

    // Calculate animation
    this.params.animationProgress += deltaTime / 1000;
    const animValue = this.params.animationProgress;

    let x = (this.params.x / 100) * ctx.canvas.width;
    let y = (this.params.y / 100) * ctx.canvas.height;
    let alpha = this.intensity;

    // Apply animation
    switch (this.params.animation) {
      case 'fade':
        alpha = Math.sin(animValue) * 0.5 + 0.5;
        break;
      case 'slide':
        x = x + Math.sin(animValue * 2) * 50;
        break;
      case 'bounce':
        y = y + Math.abs(Math.sin(animValue * 3)) * 30;
        break;
    }

    // Set text properties
    ctx.font = `bold ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha;

    // Draw text stroke
    if (this.params.strokeWidth > 0) {
      ctx.strokeStyle = this.params.strokeColor;
      ctx.lineWidth = this.params.strokeWidth;
      ctx.strokeText(this.params.text, x, y);
    }

    // Draw text fill
    ctx.fillStyle = this.params.color;
    ctx.fillText(this.params.text, x, y);

    // Restore context
    ctx.restore();

    return imageData;
  }

  setText(text) {
    this.params.text = text;
  }

  setPosition(x, y) {
    this.params.x = x;
    this.params.y = y;
  }

  setStyle(options) {
    this.updateParams(options);
  }

  setAnimation(animation) {
    this.params.animation = animation;
    this.params.animationProgress = 0;
  }
}

export default TextOverlayEffect;
