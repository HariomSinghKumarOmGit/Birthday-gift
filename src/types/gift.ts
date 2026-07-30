export interface Gift {
  id: string;
  image_url: string;
  storage_path: string;
  sender_name?: string;
  recipient_name?: string;
  created_at: string;
}

export interface VoxelData {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  brightness: number;
  size?: number; // Adaptive voxel scaling for high-res subjects vs low-res backgrounds
}
