'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import VoxelMesh from './VoxelMesh';
import { VoxelData } from '@/types/gift';
import { RotateCcw, Sparkles, ZoomIn, Volume2, VolumeX, Heart } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(audioEngine.getMuted());
  }, []);

  const handleToggleMute = () => {
    const mutedState = audioEngine.toggleMute();
    setIsMuted(mutedState);
  };

  const handleReplaySparkles = () => {
    audioEngine.playUnwrapSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#eab308', '#ffffff'],
    });
  };

  // Determine appropriate camera distance based on maximum voxel grid extent
  const gridWidth = Math.max(...voxels.map((v) => Math.abs(v.x))) * 2 || 75;
  const initialCameraZ = Math.max(80, gridWidth * 1.5);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-950">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Floating Header Banner inside Canvas area */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-center justify-between pointer-events-none gap-3">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2.5 text-white font-medium text-sm">
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
          <span>
            {recipientName ? `For ${recipientName}` : 'Special Gift'}
            {senderName ? ` from ${senderName}` : ''}
          </span>
        </div>

        {/* Controls & Hints */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hidden sm:flex bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 text-xs text-slate-300 items-center gap-3">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-indigo-400" /> Drag to Rotate
            </span>
            <span className="flex items-center gap-1">
              <ZoomIn className="w-3 h-3 text-indigo-400" /> Pinch to Zoom
            </span>
          </div>

          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 ${
              !isMuted
                ? 'bg-purple-600/80 border-purple-400/50 text-white shadow-purple-500/20'
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-4 h-4 text-purple-200" />
                <span className="hidden md:inline">Audio ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline">Muted</span>
              </>
            )}
          </button>
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
          onClick={handleReplaySparkles}
          className="px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-all shadow-md backdrop-blur-md flex items-center gap-1.5"
          title="Replay sparkles & sound"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Celebrate</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 ${
            autoRotate
              ? 'bg-purple-600/80 border-purple-400/50 text-white shadow-purple-500/20'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}</span>
        </button>
      </div>
    </div>
  );
}
