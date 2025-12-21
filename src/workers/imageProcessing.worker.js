/**
 * Web Worker for heavy image processing operations
 * Offloads pixel manipulation to background thread
 */

// Gaussian blur kernel
function gaussianBlur(imageData, radius) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  // Simplified box blur (faster than true Gaussian)
  const kernelSize = radius * 2 + 1;
  const kernelSum = kernelSize * kernelSize;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const offset = (py * width + px) * 4;
          
          r += data[offset];
          g += data[offset + 1];
          b += data[offset + 2];
          a += data[offset + 3];
        }
      }
      
      const offset = (y * width + x) * 4;
      output[offset] = r / kernelSum;
      output[offset + 1] = g / kernelSum;
      output[offset + 2] = b / kernelSum;
      output[offset + 3] = a / kernelSum;
    }
  }
  
  return new ImageData(output, width, height);
}

// Edge detection
function edgeDetect(imageData) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data.length);
  
  // Sobel operator
  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const offset = ((y + ky) * width + (x + kx)) * 4;
          const intensity = (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
          
          gx += intensity * sobelX[ky + 1][kx + 1];
          gy += intensity * sobelY[ky + 1][kx + 1];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const offset = (y * width + x) * 4;
      
      output[offset] = magnitude;
      output[offset + 1] = magnitude;
      output[offset + 2] = magnitude;
      output[offset + 3] = 255;
    }
  }
  
  return new ImageData(output, width, height);
}

// Pixelate effect
function pixelate(imageData, blockSize) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;
      
      // Average color in block
      for (let by = 0; by < blockSize && y + by < height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
          const offset = ((y + by) * width + (x + bx)) * 4;
          r += data[offset];
          g += data[offset + 1];
          b += data[offset + 2];
          count++;
        }
      }
      
      r /= count;
      g /= count;
      b /= count;
      
      // Fill block with average color
      for (let by = 0; by < blockSize && y + by < height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
          const offset = ((y + by) * width + (x + bx)) * 4;
          output[offset] = r;
          output[offset + 1] = g;
          output[offset + 2] = b;
        }
      }
    }
  }
  
  return new ImageData(output, width, height);
}

// Sharpen effect
function sharpen(imageData, amount = 1) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  const kernel = [
    [0, -amount, 0],
    [-amount, 1 + 4 * amount, -amount],
    [0, -amount, 0]
  ];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const offset = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[offset] * kernel[ky + 1][kx + 1];
          }
        }
        
        const offset = (y * width + x) * 4 + c;
        output[offset] = Math.min(255, Math.max(0, sum));
      }
    }
  }
  
  return new ImageData(output, width, height);
}

// Listen for messages
self.addEventListener('message', (event) => {
  const { type, imageData, params } = event.data;
  
  let result;
  
  try {
    switch (type) {
      case 'blur':
        result = gaussianBlur(imageData, params.radius || 5);
        break;
      
      case 'edge_detect':
        result = edgeDetect(imageData);
        break;
      
      case 'pixelate':
        result = pixelate(imageData, params.blockSize || 10);
        break;
      
      case 'sharpen':
        result = sharpen(imageData, params.amount || 1);
        break;
      
      default:
        throw new Error(`Unknown processing type: ${type}`);
    }
    
    postMessage({
      type: 'result',
      imageData: result,
      originalType: type
    });
  } catch (error) {
    postMessage({
      type: 'error',
      error: error.message,
      originalType: type
    });
  }
});
