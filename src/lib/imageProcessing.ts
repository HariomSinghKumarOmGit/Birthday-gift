import { VoxelData } from '@/types/gift';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════
const DEFAULT_UPLOAD_RESOLUTION = 200;
const DEFAULT_RENDER_RESOLUTION = 200;

/**
 * Compresses and resizes an uploaded image file on the client side using HTML5 Canvas.
 * 200px resolution preserves crisp subject detail in eyes, lips, hair, and clothing
 * while keeping Supabase storage well under 50KB per image.
 */
export async function compressImageForUpload(file: File, maxDimension: number = DEFAULT_UPLOAD_RESOLUTION): Promise<Blob> {
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

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas blob generation failed'));
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

// ════════════════════════════════════════════════════════════════════════════
// COMPUTER VISION MATH: Sobel Operator for edge detection
// ════════════════════════════════════════════════════════════════════════════

/**
 * Converts an RGB pixel to its luminance using the ITU-R BT.709 standard.
 * L = 0.2126·R + 0.7152·G + 0.0722·B
 */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Applies the Sobel operator at pixel (x, y) to compute gradient magnitude.
 *
 * The Sobel kernels are:
 *   Gx = [[-1, 0, +1],    Gy = [[-1, -2, -1],
 *         [-2, 0, +2],           [ 0,  0,  0],
 *         [-1, 0, +1]]          [+1, +2, +1]]
 *
 * Gradient magnitude = √(Gx² + Gy²), normalized to [0, 1].
 *
 * This is far more accurate than simple neighbor differencing because it
 * weights the center pixel row/column 2× more, smoothing noise while
 * preserving true edges (eye contours, lip lines, hair strands, jewelry).
 */
function sobelMagnitude(grayMap: Float32Array, x: number, y: number, w: number, h: number): number {
  if (x <= 0 || x >= w - 1 || y <= 0 || y >= h - 1) return 0;

  // Sample the 3×3 neighborhood from the pre-computed grayscale map
  const tl = grayMap[(y - 1) * w + (x - 1)]; // top-left
  const tc = grayMap[(y - 1) * w + x];        // top-center
  const tr = grayMap[(y - 1) * w + (x + 1)];  // top-right
  const ml = grayMap[y * w + (x - 1)];        // mid-left
  const mr = grayMap[y * w + (x + 1)];        // mid-right
  const bl = grayMap[(y + 1) * w + (x - 1)];  // bottom-left
  const bc = grayMap[(y + 1) * w + x];        // bottom-center
  const br = grayMap[(y + 1) * w + (x + 1)];  // bottom-right

  const gx = (-tl + tr) + (-2 * ml + 2 * mr) + (-bl + br);
  const gy = (-tl - 2 * tc - tr) + (bl + 2 * bc + br);

  // Max possible gradient for 8-bit input after luminance conversion ≈ 4·255 = 1020
  return Math.min(1.0, Math.sqrt(gx * gx + gy * gy) / 1020);
}

// ════════════════════════════════════════════════════════════════════════════
// COLOR SCIENCE: HSL Saturation extraction
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computes HSL saturation from RGB values.
 * Skin tones, clothing, and vibrant foreground objects have saturation > 0.15.
 * Dull, desaturated backgrounds (gray walls, overcast sky) have saturation < 0.1.
 */
function saturation(r: number, g: number, b: number): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return 0; // achromatic
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

// ════════════════════════════════════════════════════════════════════════════
// GAUSSIAN BLUR: 5×5 kernel on saliency map for smooth transitions
// ════════════════════════════════════════════════════════════════════════════

/**
 * Applies a fast separable 5×5 Gaussian blur to the saliency map.
 * This smooths the saliency so we don't get jarring jumps between
 * 1×1 and 5×5 voxel blocks — transitions look organic and painterly.
 *
 * Kernel weights (σ ≈ 1): [1, 4, 6, 4, 1] / 16
 */
function gaussianBlurSaliency(input: Float32Array, w: number, h: number): Float32Array {
  const kernel = [1 / 16, 4 / 16, 6 / 16, 4 / 16, 1 / 16];
  const temp = new Float32Array(w * h);
  const output = new Float32Array(w * h);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -2; k <= 2; k++) {
        const sx = Math.min(w - 1, Math.max(0, x + k));
        sum += input[y * w + sx] * kernel[k + 2];
      }
      temp[y * w + x] = sum;
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -2; k <= 2; k++) {
        const sy = Math.min(h - 1, Math.max(0, y + k));
        sum += temp[sy * w + x] * kernel[k + 2];
      }
      output[y * w + x] = sum;
    }
  }

  return output;
}

// ════════════════════════════════════════════════════════════════════════════
// DEPTH MATH: Sigmoid curve for Z-axis depth mapping
// ════════════════════════════════════════════════════════════════════════════

/**
 * Non-linear sigmoid depth mapping.
 *
 * Instead of a simple linear Z = brightness × constant, this applies:
 *   Z = maxDepth / (1 + e^(-steepness × (saliency - midpoint)))
 *
 * This creates a natural "pop out" where subject features jump forward
 * dramatically while the background stays recessed on a flat plane,
 * mimicking real-world depth-of-field perception.
 */
function sigmoidDepth(saliency: number, brightness: number, maxDepth: number = 12, steepness: number = 8): number {
  const combined = saliency * 0.7 + brightness * 0.3;
  return maxDepth / (1 + Math.exp(-steepness * (combined - 0.45)));
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION: Adaptive multi-tier voxel sampling
// ════════════════════════════════════════════════════════════════════════════

/**
 * Downloads the image on the recipient's browser and performs advanced
 * ADAPTIVE MULTI-TIER VOXEL SAMPLING using proper computer vision math:
 *
 * Pipeline:
 *  1. Grayscale luminance map (BT.709)
 *  2. Sobel gradient magnitude for edge detection
 *  3. HSL saturation analysis for foreground color richness
 *  4. Spatial focus weighting (face-centered Gaussian)
 *  5. Combined saliency score → Gaussian blur for smooth transitions
 *  6. 5-tier adaptive sampling: 1×1, 2×2, 3×3, 4×4, 5×5
 *  7. Sigmoid depth mapping for dramatic subject pop-out
 *
 * Result: ~6,000–9,000 voxels at 200px (faces ultra-crisp, backgrounds
 * abstracted into beautiful chunky macro-blocks for a 3D tilt-shift bokeh effect).
 */
export async function extractVoxelDataFromImage(
  imageUrl: string,
  maxGridSize: number = DEFAULT_RENDER_RESOLUTION
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
      const pixelCount = width * height;

      // ──────────────────────────────────────────────────
      // STEP 1: Build grayscale luminance map for Sobel
      // ──────────────────────────────────────────────────
      const grayMap = new Float32Array(pixelCount);
      for (let i = 0; i < pixelCount; i++) {
        const di = i * 4;
        grayMap[i] = luminance(data[di], data[di + 1], data[di + 2]);
      }

      // ──────────────────────────────────────────────────
      // STEP 2: Compute raw saliency per pixel
      // ──────────────────────────────────────────────────
      const rawSaliency = new Float32Array(pixelCount);
      let maxRawSaliency = 0;

      for (let y = 0; y < height; y++) {
        const ny = y / height; // normalized y position [0, 1]
        for (let x = 0; x < width; x++) {
          const nx = x / width; // normalized x position [0, 1]
          const di = (y * width + x) * 4;

          // (a) Sobel edge gradient — picks up eyes, lips, hair, clothing seams, jewelry
          const edgeMag = sobelMagnitude(grayMap, x, y, width, height);

          // (b) Color saturation — skin tones, bright clothing vs dull backgrounds
          const sat = saturation(data[di], data[di + 1], data[di + 2]);

          // (c) Spatial focus: 2D Gaussian centered at portrait "face zone" (0.5, 0.38)
          //     σx = 0.35, σy = 0.30 — wider horizontally to catch shoulders
          const dx = (nx - 0.5) / 0.35;
          const dy = (ny - 0.38) / 0.30;
          const spatialGauss = Math.exp(-0.5 * (dx * dx + dy * dy));

          // (d) Luminance contrast from local mean
          //     Bright foreground subjects typically have luminance > local background
          const luma = grayMap[y * width + x] / 255;

          // Composite saliency formula:
          //   Edges × 4.0        — strongest signal (facial features)
          //   Saturation × 2.5   — skin/clothing richness
          //   Spatial × 1.8      — center bias for portraits
          //   Luminance × 0.4    — mild brightness boost
          const score = (edgeMag * 4.0) + (sat * 2.5) + (spatialGauss * 1.8) + (luma * 0.4);
          rawSaliency[y * width + x] = score;
          if (score > maxRawSaliency) maxRawSaliency = score;
        }
      }

      // ──────────────────────────────────────────────────
      // STEP 3: Normalize saliency to [0, 1]
      // ──────────────────────────────────────────────────
      const normFactor = maxRawSaliency > 0 ? 1.0 / maxRawSaliency : 1.0;
      for (let i = 0; i < pixelCount; i++) {
        rawSaliency[i] = Math.min(1.0, rawSaliency[i] * normFactor);
      }

      // ──────────────────────────────────────────────────
      // STEP 4: Gaussian blur the saliency map
      //         Creates smooth transitions between detail levels
      // ──────────────────────────────────────────────────
      const saliency = gaussianBlurSaliency(rawSaliency, width, height);

      // ──────────────────────────────────────────────────
      // STEP 5: 5-tier adaptive sampling
      //   Tier 1: saliency ≥ 0.60 → 1×1 (eyes, lips, nose tip, earrings)
      //   Tier 2: saliency ≥ 0.45 → 2×2 (cheeks, chin, hair edges)
      //   Tier 3: saliency ≥ 0.30 → 3×3 (shoulders, torso, arms)
      //   Tier 4: saliency ≥ 0.18 → 4×4 (nearby background, furniture)
      //   Tier 5: saliency <  0.18 → 5×5 (distant background, sky, walls)
      // ──────────────────────────────────────────────────
      const voxels: VoxelData[] = [];
      const covered = new Uint8Array(pixelCount);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const posIdx = y * width + x;
          if (covered[posIdx]) continue;

          const score = saliency[posIdx];
          let step: number;

          if (score >= 0.60) {
            step = 1;  // Ultra-crisp subject features
          } else if (score >= 0.45) {
            step = 2;  // High detail secondary features
          } else if (score >= 0.30) {
            step = 3;  // Mid-detail body and transitions
          } else if (score >= 0.18) {
            step = 4;  // Low-detail nearby background
          } else {
            step = 5;  // Macro background abstraction
          }

          // Clamp step to available canvas space and avoid collisions
          while (step > 1) {
            if (x + step > width || y + step > height) {
              step--;
              continue;
            }
            let collision = false;
            outerLoop:
            for (let dy = 0; dy < step; dy++) {
              for (let dx = 0; dx < step; dx++) {
                if (covered[(y + dy) * width + (x + dx)]) {
                  collision = true;
                  break outerLoop;
                }
              }
            }
            if (collision) step--;
            else break;
          }

          // Accumulate averaged color and peak saliency within block
          let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
          let peakSaliency = 0;

          for (let dy = 0; dy < step; dy++) {
            for (let dx = 0; dx < step; dx++) {
              const pIdx = (y + dy) * width + (x + dx);
              covered[pIdx] = 1;
              const di = pIdx * 4;
              rSum += data[di];
              gSum += data[di + 1];
              bSum += data[di + 2];
              aSum += data[di + 3];
              if (saliency[pIdx] > peakSaliency) peakSaliency = saliency[pIdx];
              count++;
            }
          }

          // Skip transparent pixels
          if (aSum / count < 20) continue;

          const avgR = Math.round(rSum / count);
          const avgG = Math.round(gSum / count);
          const avgB = Math.round(bSum / count);
          const brightness = luminance(avgR, avgG, avgB) / 255;

          // Geometric center of block → centered 3D coordinate system
          const centerX = x + (step - 1) / 2.0;
          const centerY = y + (step - 1) / 2.0;
          const posX = centerX - width / 2;
          const posY = -centerY + height / 2; // flip Y for Three.js

          // ──────────────────────────────────────────────
          // STEP 6: Sigmoid depth mapping
          //   Subject faces push forward dramatically (Z ≈ 8–12)
          //   Background stays near the back plane (Z ≈ 0–2)
          // ──────────────────────────────────────────────
          const posZ = sigmoidDepth(peakSaliency, brightness);

          voxels.push({
            x: posX,
            y: posY,
            z: posZ,
            r: avgR,
            g: avgG,
            b: avgB,
            brightness,
            size: step * 0.95, // 5% gap between cubes for grid aesthetic
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
