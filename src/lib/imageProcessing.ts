import { VoxelData } from '@/types/gift';

/**
 * Compresses and resizes an uploaded image file on the client side using HTML5 Canvas.
 * Upgraded to 140px base resolution to enable crisp detail on human faces and bodies.
 */
export async function compressImageForUpload(file: File, maxDimension: number = 140): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2d context from canvas'));
        return;
      }

      // High quality resizing for detailed portraits
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export to lossless PNG blob to preserve crisp edge boundaries for saliency detection
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas blob generation failed'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

/**
 * Helper to measure color edge sharpness at (x, y) to identify high-frequency subject details like eyes, hair, and clothing contours.
 */
function getEdgeContrast(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number {
  if (x >= width - 1 || y >= height - 1 || x <= 0 || y <= 0) return 0;
  const idx = (y * width + x) * 4;
  const idxRight = (y * width + (x + 1)) * 4;
  const idxDown = ((y + 1) * width + x) * 4;

  const diffX = Math.abs(data[idx] - data[idxRight]) + Math.abs(data[idx+1] - data[idxRight+1]) + Math.abs(data[idx+2] - data[idxRight+2]);
  const diffY = Math.abs(data[idx] - data[idxDown]) + Math.abs(data[idx+1] - data[idxDown+1]) + Math.abs(data[idx+2] - data[idxDown+2]);

  return Math.min(1.0, (diffX + diffY) / (255 * 3));
}

/**
 * Downloads the image on the recipient browser and performs ADAPTIVE VOXEL SAMPLING:
 * - High resolution (1x1 cubes) on the subject face, body, and sharp foreground features.
 * - Medium resolution (2x2 cubes) on shoulders and transitions.
 * - Low resolution (3x3 blocks) on uniform backgrounds to save processing power while creating a 3D Bokeh effect!
 */
export async function extractVoxelDataFromImage(
  imageUrl: string,
  maxGridSize: number = 140
): Promise<{ voxels: VoxelData[]; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      let { width, height } = img;
      if (width > maxGridSize || height > maxGridSize) {
        if (width > height) {
          height = Math.round((height * maxGridSize) / width);
          width = maxGridSize;
        } else {
          width = Math.round((width * maxGridSize) / height);
          height = maxGridSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2d context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const voxels: VoxelData[] = [];
      const covered = new Uint8Array(width * height);

      // Pre-calculate saliency (subject importance) for each pixel
      const saliency = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        const ny = y / height;
        for (let x = 0; x < width; x++) {
          const nx = x / width;
          
          // Spatial bias: human subjects are mostly centered horizontally and in upper/middle vertical field
          const distFromFocus = Math.sqrt(Math.pow((nx - 0.5) * 1.5, 2) + Math.pow((ny - 0.42) * 1.2, 2));
          const spatialWeight = Math.max(0, 1.0 - distFromFocus * 1.35);

          // Edge texture density (eyes, nose, smile, hair, jewelry, garment outlines)
          const edgeSharpness = getEdgeContrast(data, x, y, width, height);

          // Luminance importance (skin tones and lit foreground items)
          const idx = (y * width + x) * 4;
          const luma = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;

          // Saliency Formula: balances central subject position + crisp features + luminance
          const totalScore = (spatialWeight * 0.5) + (edgeSharpness * 3.2) + (luma * 0.15);
          saliency[y * width + x] = Math.min(1.0, totalScore);
        }
      }

      // Adaptive sampling loop: group low-saliency background into macro-voxels, preserve crisp 1x1 on face/body
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const posIdx = y * width + x;
          if (covered[posIdx]) continue;

          const score = saliency[posIdx];
          let step = 1;

          if (score < 0.35) {
            step = 3; // Low background saliency: group into 3x3 macro cube
          } else if (score < 0.55) {
            step = 2; // Mid transition: group into 2x2 cube
          } else {
            step = 1; // High importance subject (face & features): crisp 1x1 cube!
          }

          // Check boundary and coverage availability for proposed block size
          while (step > 1) {
            if (x + step > width || y + step > height) {
              step--;
              continue;
            }
            let collision = false;
            for (let dy = 0; dy < step && !collision; dy++) {
              for (let dx = 0; dx < step && !collision; dx++) {
                if (covered[(y + dy) * width + (x + dx)]) {
                  collision = true;
                }
              }
            }
            if (collision) {
              step--;
            } else {
              break;
            }
          }

          // Mark pixels in block as covered and accumulate average color
          let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
          let maxSaliencyInBlock = score;
          for (let dy = 0; dy < step; dy++) {
            for (let dx = 0; dx < step; dx++) {
              const pIdx = (y + dy) * width + (x + dx);
              covered[pIdx] = 1;
              const dataIdx = pIdx * 4;
              rSum += data[dataIdx];
              gSum += data[dataIdx + 1];
              bSum += data[dataIdx + 2];
              aSum += data[dataIdx + 3];
              if (saliency[pIdx] > maxSaliencyInBlock) maxSaliencyInBlock = saliency[pIdx];
              count++;
            }
          }

          const avgA = aSum / count;
          // Ignore transparent backgrounds
          if (avgA < 20) continue;

          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);

          const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

          // Compute geometric center of the merged block
          const centerX = x + (step - 1) / 2.0;
          const centerY = y + (step - 1) / 2.0;

          // Transform to centered 3D coordinate system
          const posX = centerX - width / 2;
          const posY = -centerY + height / 2;
          
          // Enhanced depth pop-out: High-saliency subject features push outward in Z-space, background recedes!
          const posZ = (brightness - 0.4) * 8 + (maxSaliencyInBlock * 5.5);

          voxels.push({
            x: posX,
            y: posY,
            z: posZ,
            r: avgR,
            g: avgG,
            b: avgB,
            brightness,
            size: step * 0.96, // Slight spacing gap between cubes for high-tech grid aesthetics
          });
        }
      }

      resolve({ voxels, width, height });
    };

    img.onerror = () => {
      reject(new Error(`Could not load image from URL: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
}
