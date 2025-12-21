/* eslint-disable */
/**
 * Video Export Engine - Real H.264/H.265 encoding with transitions
 * Uses ffmpeg.wasm for client-side video processing
 * Supports local export and cloud backup
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { storageManager, STORES } from './storageManager';

class VideoExporter {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * Initialize FFmpeg.wasm
   */
  async load() {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        this.ffmpeg = new FFmpeg();
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.isLoaded = true;
        console.log('✅ FFmpeg loaded successfully');
      } catch (error) {
        console.error('FFmpeg load error:', error);
        throw error;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Export video from timeline clips
   */
  async exportVideo(clips, options = {}) {
    const {
      format = 'mp4',
      codec = 'libx264',
      quality = 'high', // 'low', 'medium', 'high', 'ultra'
      resolution = '1080p',
      fps = 30,
      userId = null,
      onProgress = null
    } = options;

    await this.load();

    // Quality settings
    const qualityMap = {
      low: { crf: 28, preset: 'veryfast' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' },
      ultra: { crf: 15, preset: 'veryslow' }
    };

    const { crf, preset } = qualityMap[quality] || qualityMap.high;

    // Resolution settings
    const resolutionMap = {
      '480p': '854x480',
      '720p': '1280x720',
      '1080p': '1920x1080',
      '1440p': '2560x1440',
      '4K': '3840x2160'
    };

    const scale = resolutionMap[resolution] || resolutionMap['1080p'];

    try {
      // Write input files to FFmpeg virtual filesystem
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        await this.ffmpeg.writeFile(`input_${i}.mp4`, await fetchFile(clip.file));
      }

      // Generate filter complex for transitions and effects
      const filterComplex = this.generateFilterComplex(clips);

      // Build FFmpeg command
      const command = [
        ...clips.map((_, i) => ['-i', `input_${i}.mp4`]).flat(),
        '-filter_complex', filterComplex,
        '-c:v', codec,
        '-crf', crf.toString(),
        '-preset', preset,
        '-vf', `scale=${scale}`,
        '-r', fps.toString(),
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        'output.mp4'
      ];

      // Execute FFmpeg
      this.ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      });

      await this.ffmpeg.exec(command);

      // Read output file
      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Save locally and optionally to cloud
      if (userId) {
        await storageManager.saveSmart(
          STORES.VIDEOS,
          'exported-videos',
          {
            name: `export_${Date.now()}.mp4`,
            blob,
            type: 'video/mp4',
            size: blob.size,
            resolution,
            fps,
            codec,
            quality
          },
          userId,
          { cloudSync: true }
        );
      }

      // Cleanup
      for (let i = 0; i < clips.length; i++) {
        await this.ffmpeg.deleteFile(`input_${i}.mp4`);
      }
      await this.ffmpeg.deleteFile('output.mp4');

      return { blob, url, size: blob.size };

    } catch (error) {
      console.error('Video export error:', error);
      throw error;
    }
  }

  /**
   * Generate FFmpeg filter complex for transitions and effects
   */
  generateFilterComplex(clips) {
    if (clips.length === 1) {
      return '[0:v]null[v]';
    }

    const filters = [];
    let currentLabel = '0:v';

    for (let i = 0; i < clips.length - 1; i++) {
      const clip = clips[i];
      const nextClip = clips[i + 1];
      const transition = clip.transition || 'fade';
      const duration = clip.transitionDuration || 1;

      const outputLabel = i === clips.length - 2 ? 'v' : `v${i}`;
      
      // Apply transition
      switch (transition) {
        case 'fade':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=fade:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        case 'dissolve':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=dissolve:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        case 'wipeleft':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=wipeleft:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        case 'wiperight':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=wiperight:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        case 'slideup':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=slideup:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        case 'slidedown':
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=slidedown:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
          break;
        default:
          filters.push(`[${currentLabel}][${i + 1}:v]xfade=transition=fade:duration=${duration}:offset=${clip.duration - duration}[${outputLabel}]`);
      }

      currentLabel = outputLabel;
    }

    return filters.join(';');
  }

  /**
   * Apply single effect to video
   */
  async applyEffect(videoFile, effect, options = {}) {
    await this.load();

    const effectFilters = {
      blur: `gblur=sigma=${options.intensity || 5}`,
      sharpen: `unsharp=5:5:${options.intensity || 1.0}:5:5:0.0`,
      brightness: `eq=brightness=${options.value || 0.1}`,
      contrast: `eq=contrast=${options.value || 1.2}`,
      saturation: `eq=saturation=${options.value || 1.5}`,
      grayscale: `hue=s=0`,
      sepia: `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`,
      vignette: `vignette`,
      chromakey: `chromakey=${options.color || 'green'}:${options.similarity || 0.3}:${options.blend || 0.1}`,
      stabilize: `vidstabdetect`,
      denoise: `hqdn3d=${options.intensity || 4}`
    };

    const filter = effectFilters[effect];
    if (!filter) {
      throw new Error(`Unknown effect: ${effect}`);
    }

    try {
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', filter,
        '-c:a', 'copy',
        'output.mp4'
      ]);

      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      await this.ffmpeg.deleteFile('input.mp4');
      await this.ffmpeg.deleteFile('output.mp4');

      return { blob, url };

    } catch (error) {
      console.error('Effect application error:', error);
      throw error;
    }
  }

  /**
   * Extract frames from video
   */
  async extractFrames(videoFile, options = {}) {
    const { fps = 1, format = 'jpg' } = options;

    await this.load();

    try {
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${fps}`,
        `frame_%04d.${format}`
      ]);

      // Read all extracted frames
      const frames = [];
      let frameIndex = 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const frameName = `frame_${String(frameIndex).padStart(4, '0')}.${format}`;
          const data = await this.ffmpeg.readFile(frameName);
          const blob = new Blob([data.buffer], { type: `image/${format}` });
          frames.push({ blob, url: URL.createObjectURL(blob), index: frameIndex });
          await this.ffmpeg.deleteFile(frameName);
          frameIndex++;
        } catch {
          break;
        }
      }

      await this.ffmpeg.deleteFile('input.mp4');

      return frames;

    } catch (error) {
      console.error('Frame extraction error:', error);
      throw error;
    }
  }

  /**
   * Create video from images
   */
  async createFromImages(images, options = {}) {
    const { fps = 30, duration = 5, transition = 'fade', userId = null } = options;

    await this.load();

    try {
      // Write images to FFmpeg
      for (let i = 0; i < images.length; i++) {
        await this.ffmpeg.writeFile(`img_${i}.jpg`, await fetchFile(images[i]));
      }

      // Create concat file
      const concatContent = images.map((_, i) => `file 'img_${i}.jpg'\nduration ${duration}`).join('\n');
      await this.ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      // Generate video
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', `fps=${fps}`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        'output.mp4'
      ]);

      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Cleanup
      for (let i = 0; i < images.length; i++) {
        await this.ffmpeg.deleteFile(`img_${i}.jpg`);
      }
      await this.ffmpeg.deleteFile('concat.txt');
      await this.ffmpeg.deleteFile('output.mp4');

      if (userId) {
        await storageManager.saveLocal(STORES.VIDEOS, {
          userId,
          name: `slideshow_${Date.now()}.mp4`,
          blob,
          type: 'video/mp4',
          size: blob.size
        });
      }

      return { blob, url };

    } catch (error) {
      console.error('Image to video error:', error);
      throw error;
    }
  }

  /**
   * Estimate export time
   */
  estimateExportTime(clips, resolution) {
    const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
    const resolutionMultiplier = {
      '480p': 0.5,
      '720p': 1,
      '1080p': 2,
      '1440p': 4,
      '4K': 8
    };

    const multiplier = resolutionMultiplier[resolution] || 2;
    const estimatedSeconds = Math.ceil(totalDuration * multiplier * 0.5); // ~0.5x real-time for 1080p

    return {
      min: Math.max(5, estimatedSeconds - 10),
      max: estimatedSeconds + 20,
      estimated: estimatedSeconds
    };
  }
}

// Export singleton
export const videoExporter = new VideoExporter();

// Preload FFmpeg on user interaction
if (typeof window !== 'undefined') {
  let loaded = false;
  const preload = () => {
    if (!loaded) {
      loaded = true;
      videoExporter.load().catch(console.error);
    }
  };
  
  window.addEventListener('click', preload, { once: true });
  window.addEventListener('keydown', preload, { once: true });
}
