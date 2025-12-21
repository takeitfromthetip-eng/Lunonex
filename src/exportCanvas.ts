/* eslint-disable */
import { saveAs } from 'file-saver';
// @ts-ignore
import { logArtifactDrop } from './artifactLogger.js';

function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || '';
  if (!arr[1]) throw new Error('Invalid dataURL');
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export function exportCanvas(
  canvas: { toDataURL: (opts: { format: string }) => string },
  format: 'png' | 'svg' | 'psd',
  userId: string
) {
  const timestamp = new Date();
  const legacyId = `ART-${userId}-${format}-${timestamp.getTime()}`;
  const dataURL = canvas.toDataURL({ format });

  logArtifactDrop(userId, format, timestamp);

  const blob = dataURLtoBlob(dataURL);
  saveAs(blob, `${legacyId}.${format}`);
}
