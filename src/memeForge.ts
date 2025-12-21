// memeForge.ts
import * as fabric from 'fabric';

export function generateMeme(imageURL: string, topText: string, bottomText: string) {
  const canvas = new fabric.Canvas('meme-canvas');
  fabric.Image.fromURL(imageURL, { crossOrigin: 'anonymous' } as any).then((img: any) => {
    if (!img) return;
    canvas.add(img);
    const top = new fabric.Text(topText, {
      top: 10,
      left: canvas.width ? canvas.width / 2 : 0,
      originX: 'center',
      fontSize: 40,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      fontWeight: 'bold',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', offsetX: 2, offsetY: 2, blur: 2 }) as any,
    });
    const bottom = new fabric.Text(bottomText, {
      top: (img.height ? img.height : 0) - 60,
      left: canvas.width ? canvas.width / 2 : 0,
      originX: 'center',
      fontSize: 40,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      fontWeight: 'bold',
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', offsetX: 2, offsetY: 2, blur: 2 }) as any,
    });
    canvas.add(top);
    canvas.add(bottom);
  });
}
