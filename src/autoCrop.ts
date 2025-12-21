// autoCrop.ts
export interface CroppedImage {
  blob?: Blob;
  dataURL?: string;
  duplicatesRemoved?: number;
  exampleMatchesDeleted?: number;
}

export interface AutoCropOptions {
  removeDuplicates?: boolean;
  exampleImages?: Blob[];
  similarityThreshold?: number; // 0-100, default 90
}

export async function autoCrop(image: Blob, options?: AutoCropOptions): Promise<CroppedImage> {
  const formData = new FormData();
  formData.append('image', image);

  if (options?.removeDuplicates) {
    formData.append('removeDuplicates', 'true');
  }

  if (options?.exampleImages && options.exampleImages.length > 0) {
    options.exampleImages.forEach((example, index) => {
      formData.append(`example_${index}`, example);
    });
  }

  if (options?.similarityThreshold !== undefined) {
    formData.append('similarityThreshold', options.similarityThreshold.toString());
  }

  const response = await fetch('/api/crop', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`Auto-crop failed: ${response.statusText}`);
  return await response.json();
}

// Helper function to compute perceptual hash for duplicate detection
export async function computeImageHash(image: Blob): Promise<string> {
  const response = await fetch('/api/image-hash', {
    method: 'POST',
    body: image,
  });
  if (!response.ok) throw new Error('Failed to compute image hash');
  const { hash } = (await response.json()) as { hash: string };
  return hash;
}

// Helper function to compare image similarity
export async function compareImages(image1: Blob, image2: Blob): Promise<number> {
  const formData = new FormData();
  formData.append('image1', image1);
  formData.append('image2', image2);

  const response = await fetch('/api/image-similarity', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to compare images');
  const { similarity } = (await response.json()) as { similarity: number };
  return similarity; // Returns 0-100
}
