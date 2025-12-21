// gifForge.ts
// @ts-ignore
import GIF from 'gif.js';

export function createGIF(frames: HTMLCanvasElement[], delay: number = 200): Promise<Blob> {
  return new Promise(resolve => {
    const gif = new GIF({ workers: 2, quality: 10 });
    frames.forEach(frame => gif.addFrame(frame, { delay }));
    gif.on('finished', (blob: Blob) => resolve(blob));
    gif.render();
  });
}
