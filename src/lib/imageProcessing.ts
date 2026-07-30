import { VoxelData } from '@/types/gift';

/**
 * Compresses and resizes an uploaded image file on the client side using HTML5 Canvas.
 * Resizing to ~75px max dimension ensures optimum Voxel grid performance (~5,000 cubes)
 * without overloading mobile GPU or database storage.
 */
export async function compressImageForUpload(file: File, maxDimension: number = 75): Promise<Blob> {
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

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export to high quality PNG blob to avoid JPEG color banding on voxels
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
 * Downloads the image on the recipient's browser, extracts RGB pixel data from a hidden canvas,
 * and converts each non-transparent pixel into 3D space coordinates (X, Y, Z depth based on luminance).
 */
export async function extractVoxelDataFromImage(
  imageUrl: string,
  maxGridSize: number = 75
): Promise<{ voxels: VoxelData[]; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Crucial for CORS-enabled image color extraction without tainting canvas

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

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // Ignore mostly transparent pixels
          if (a < 20) continue;

          // Compute relative luminance for 3D depth pop-out effect
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Center coordinates around (0, 0)
          const posX = x - width / 2;
          // Invert Y axis (canvas Y goes downwards, Three.js Y goes upwards)
          const posY = -y + height / 2;
          // Z depth: brighter highlights protrude forward, dark regions sit deeper
          const posZ = (brightness - 0.5) * 8;

          voxels.push({
            x: posX,
            y: posY,
            z: posZ,
            r,
            g,
            b,
            brightness,
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
