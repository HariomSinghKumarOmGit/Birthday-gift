'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import VoxelMesh from './VoxelMesh';
import MascotHelper from './MascotHelper';
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
  const [isMuted, setIsMuted] = useState(() => audioEngine.getMuted());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

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

  // Reset camera to its original position via OrbitControls
  const handleResetView = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setAutoRotate(true);
    }
  }, []);

  // Determine appropriate camera distance based on maximum voxel grid extent
  const gridExtent = Math.max(
    Math.max(...voxels.map((v) => Math.abs(v.x))),
    Math.max(...voxels.map((v) => Math.abs(v.y)))
  ) * 2 || 200;
  const initialCameraZ = Math.max(120, gridExtent * 1.3);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-950">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Floating Header Banner inside Canvas area */}
      <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 z-10 flex flex-row items-center justify-between pointer-events-none gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-2 text-white font-medium text-xs sm:text-sm truncate max-w-[65%] sm:max-w-none">
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 fill-pink-400 animate-pulse shrink-0" />
          <span className="truncate">
            {recipientName ? `For ${recipientName}` : 'Special Gift'}
            {senderName ? ` from ${senderName}` : ''}
          </span>
        </div>

        {/* Controls & Hints */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
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
            className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 min-h-[40px] min-w-[40px] justify-center ${
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

      {/* ── Cute Mascot Helper (reset view on click) ── */}
      <MascotHelper onResetView={handleResetView} />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, initialCameraZ], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      >
        {/* 3-point studio lighting for cinematic portrait rendering */}
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#c8d5ff', '#1a1a2e', 0.6]} />
        {/* Key light — warm, strong, upper-right */}
        <directionalLight position={[60, 70, 50]} intensity={1.8} color="#fff5ee" />
        {/* Fill light — cool purple from left, softer */}
        <pointLight position={[-50, 20, -30]} intensity={0.7} color="#818cf8" distance={300} />
        {/* Rim/back light — pink accent from behind for edge separation */}
        <pointLight position={[20, -40, -60]} intensity={0.5} color="#f472b6" distance={250} />
        {/* Under-fill subtle bounce */}
        <pointLight position={[0, -60, 40]} intensity={0.3} color="#c4b5fd" distance={200} />

        <VoxelMesh
          voxels={voxels}
          isRevealed={isRevealed}
          onRevealComplete={onRevealComplete}
        />

        <OrbitControls
          ref={controlsRef}
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
      <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 z-10 flex gap-2">
        <button
          onClick={handleReplaySparkles}
          className="px-3 sm:px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 min-h-[38px]"
          title="Replay sparkles & sound"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Celebrate</span>
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-md backdrop-blur-md flex items-center gap-1.5 min-h-[38px] ${
            autoRotate
              ? 'bg-purple-600/80 border-purple-400/50 text-white shadow-purple-500/20'
              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate OFF'}</span>
          <span className="sm:hidden">{autoRotate ? 'Rotate ON' : 'Rotate OFF'}</span>
        </button>
      </div>
    </div>
  );
}
