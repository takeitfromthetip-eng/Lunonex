// photoEditor.ts
import * as fabric from 'fabric';

export interface EditOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export function applyPhotoEdit(image: HTMLImageElement, edits: EditOptions) {
  const canvas = new fabric.Canvas('photo-canvas');
  fabric.Image.fromURL(image.src, { crossOrigin: 'anonymous' } as any).then((img: any) => {
    if (!img) return;
    const filters: any[] = [];
    if (edits.brightness)
      filters.push(new (fabric as any).Image.filters.Brightness({ brightness: edits.brightness }));
    if (edits.contrast)
      filters.push(new (fabric as any).Image.filters.Contrast({ contrast: edits.contrast }));
    if (edits.saturation)
      filters.push(new (fabric as any).Image.filters.Saturation({ saturation: edits.saturation }));
    img.filters = filters;
    img.applyFilters?.();
    canvas.add(img);
  });
}
