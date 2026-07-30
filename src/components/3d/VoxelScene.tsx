'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import VoxelMesh from './VoxelMesh';
import { VoxelData } from '@/types/gift';
import { RotateCcw, Sparkles, ZoomIn } from 'lucide-react';

interface VoxelSceneProps {
  voxels: VoxelData[];
  isRevealed: boolean;
  onRevealComplete?: () => void;
  senderName?: string;
  recipientName?: string;
}

export default function VoxelScene({
  voxels,
  isRevealed,
  onRevealComplete,
  senderName,
  recipientName,
}: VoxelSceneProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  // Determine appropriate camera distance based on maximum voxel grid extent
  const gridWidth = Math.max(...voxels.map((v) => Math.abs(v.x))) * 2 || 75;
  const initialCameraZ = Math.max(80, gridWidth * 1.5);

  return (
    <div className="relative w-full h-[650px] md:h-[750px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 shadow-2xl backdrop-blur-md">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Floating Header Banner inside Canvas area */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2 text-white font-medium text-sm">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>
            {recipientName ? `For ${recipientName}` : '3D Voxel Gift'}
            {senderName ? ` from ${senderName}` : ''}
          </span>
        </div>

        {/* Controls Hint */}
        <div className="mt-2 sm:mt-0 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-xs text-slate-300 pointer-events-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-indigo-400" /> Drag to Rotate
          </span>
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-indigo-400" /> Pinch to Zoom
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, initialCameraZ], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[40, 50, 40]} intensity={1.5} />
        <pointLight position={[-30, -30, -20]} intensity={0.6} color="#818cf8" />
        <pointLight position={[30, -20, 30]} intensity={0.5} color="#c084fc" />

        <VoxelMesh
          voxels={voxels}
          isRevealed={isRevealed}
          onRevealComplete={onRevealComplete}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={autoRotate && isRevealed}
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={40}
          maxDistance={250}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      {/* Footer controls inside scene */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 ${
            autoRotate
              ? 'bg-purple-600/80 border-purple-400/50 text-white shadow-purple-500/20'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
          {autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}
        </button>
      </div>
    </div>
  );
}
