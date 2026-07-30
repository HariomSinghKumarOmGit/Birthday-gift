'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { extractVoxelDataFromImage } from '@/lib/imageProcessing';
import { Gift, VoxelData } from '@/types/gift';
import VoxelScene from '@/components/3d/VoxelScene';
import confetti from 'canvas-confetti';
import { Gift as GiftIcon, Sparkles, Heart, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface GiftViewerProps {
  giftId: string;
}

export default function GiftViewer({ giftId }: GiftViewerProps) {
  const [gift, setGift] = useState<Gift | null>(null);
  const [voxels, setVoxels] = useState<VoxelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    async function loadGift() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch gift metadata and public storage URL from Supabase PostgreSQL table
        const { data, error: dbError } = await supabase
          .from('gifts')
          .select('*')
          .eq('id', giftId)
          .single();

        if (dbError || !data) {
          throw new Error(
            'Gift not found or has been removed by the creator. Verify the URL or check Supabase connection credentials.'
          );
        }

        setGift(data as Gift);

        // 2. Dynamically download image in recipient browser & extract 3D RGB voxel matrix
        const { voxels: extractedVoxels } = await extractVoxelDataFromImage(data.image_url, 75);
        
        if (extractedVoxels.length === 0) {
          throw new Error('No readable color data found in image.');
        }

        setVoxels(extractedVoxels);
      } catch (err: unknown) {
        console.error('Failed to prepare 3D Voxel gift:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load gift details.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (giftId) {
      loadGift();
    }
  }, [giftId]);

  const handleUnwrap = () => {
    // Trigger celebratory confetti burst on recipient screen
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#eab308', '#ffffff'],
    });

    // Fire secondary bursts for a premium wow feeling
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#c084fc', '#f472b6', '#818cf8'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#c084fc', '#f472b6', '#818cf8'],
      });
    }, 250);

    setIsRevealed(true);
  };

  if (loading) {
    return (
      <div className="min-h-[550px] w-full max-w-4xl mx-auto rounded-3xl glass-card flex flex-col items-center justify-center p-8 border border-white/10 text-center shadow-2xl space-y-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-spin">
            <RefreshCw className="w-8 h-8 text-white animate-reverse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Preparing Your 3D Surprise...</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Your device is actively downloading the gift image and computing thousands of 3D Voxel coordinates in real time ✨
          </p>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-[450px] w-full max-w-2xl mx-auto rounded-3xl glass-card border border-rose-500/30 p-10 flex flex-col items-center justify-center text-center shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Oops! Gift Unavailable</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-white/10"
        >
          Return to VoxelGift Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12">
      {/* Before Reveal: Unwrap Interactive Screen */}
      {!isRevealed ? (
        <div className="relative overflow-hidden w-full max-w-3xl mx-auto rounded-3xl glass-card p-8 sm:p-14 border border-purple-500/30 shadow-2xl text-center flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-950">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
            <span>A special surprise awaits</span>
          </div>

          <div className="relative group cursor-pointer" onClick={handleUnwrap}>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-32 h-32 rounded-3xl bg-slate-900 border-2 border-white/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl">
              <GiftIcon className="w-16 h-16 text-purple-400 group-hover:text-pink-400 transition-colors animate-bounce" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Hello, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{gift.recipient_name || 'Friend'}!</span>
            </h2>
            <p className="text-lg text-slate-300">
              <span className="font-bold text-white">{gift.sender_name || 'Someone special'}</span> has created an exclusive interactive 3D Voxel portrait just for you!
            </p>
          </div>

          <button
            onClick={handleUnwrap}
            className="group relative px-10 py-5 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 shadow-2xl shadow-purple-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 border border-white/25 flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6 animate-spin" />
            <span>TAP TO UNWRAP YOUR GIFT</span>
            <Sparkles className="w-6 h-6 animate-spin" />
          </button>

          <p className="text-xs text-slate-500">
            Powered by hardware-accelerated WebGL & React Three Fiber
          </p>
        </div>
      ) : (
        /* After Reveal: Interactive 3D Voxel Scene */
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white">
              Gift Unwrapped! ✨
            </h2>
            <p className="text-slate-400 text-sm">
              Rotate, zoom, and explore your personal portrait translated into a modern 3D volumetric sculpture.
            </p>
          </div>

          <VoxelScene
            voxels={voxels}
            isRevealed={isRevealed}
            senderName={gift.sender_name}
            recipientName={gift.recipient_name}
          />

          {/* Call to Action for Recipient */}
          <div className="max-w-2xl mx-auto rounded-2xl glass-card p-6 border border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-base font-bold text-white">Want to surprise a friend?</h4>
              <p className="text-xs text-slate-400">Create your own customized 3D voxel gift in under 30 seconds for free!</p>
            </div>
            <Link
              href="/upload"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20 shrink-0 transition-all flex items-center gap-1.5"
            >
              <span>Create Your Own Gift</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
