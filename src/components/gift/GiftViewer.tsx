'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { extractVoxelDataFromImage } from '@/lib/imageProcessing';
import { Gift, VoxelData } from '@/types/gift';
import VoxelScene from '@/components/3d/VoxelScene';
import confetti from 'canvas-confetti';
import { Gift as GiftIcon, Sparkles, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

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
        const { data, error: dbError } = await supabase
          .from('gifts')
          .select('*')
          .eq('id', giftId)
          .single();

        if (dbError || !data) {
          throw new Error('Gift not found or has expired.');
        }

        setGift(data as Gift);

        const { voxels: extractedVoxels } = await extractVoxelDataFromImage(data.image_url, 140);

        if (extractedVoxels.length === 0) {
          throw new Error('Could not load gift content.');
        }

        setVoxels(extractedVoxels);
      } catch (err: unknown) {
        console.error('Failed to prepare gift:', err);
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

    return () => {
      audioEngine.stopBackgroundMusic();
    };
  }, [giftId]);

  const handleUnwrap = () => {
    // Play sound & start background ambient music
    audioEngine.playUnwrapSound();
    audioEngine.startBackgroundMusic();

    // Trigger celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#eab308', '#ffffff'],
    });

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
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-950">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-spin">
            <RefreshCw className="w-8 h-8 text-white animate-reverse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Preparing Your Surprise...</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Opening your special gift moment ✨
          </p>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950">
        <div className="max-w-md w-full rounded-3xl glass-card border border-rose-500/30 p-8 flex flex-col items-center space-y-5 shadow-2xl">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Gift Unavailable</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-slate-950">
      {!isRevealed ? (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950">
          <div className="relative overflow-hidden w-full max-w-lg rounded-3xl glass-card p-8 sm:p-12 border border-purple-500/30 shadow-2xl text-center flex flex-col items-center justify-center space-y-8 bg-slate-900/90 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
              <span>A special surprise awaits</span>
            </div>

            <div className="relative group cursor-pointer" onClick={handleUnwrap}>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative w-28 h-28 rounded-3xl bg-slate-900 border-2 border-white/20 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl">
                <GiftIcon className="w-14 h-14 text-purple-400 group-hover:text-pink-400 transition-colors animate-bounce" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Hello, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{gift.recipient_name || 'Friend'}!</span>
              </h2>
              <p className="text-base text-slate-300">
                <span className="font-bold text-white">{gift.sender_name || 'Someone special'}</span> has created an exclusive interactive surprise gift just for you!
              </p>
            </div>

            <button
              onClick={handleUnwrap}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 shadow-2xl shadow-purple-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 border border-white/25 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>TAP TO UNWRAP YOUR GIFT</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </button>
          </div>
        </div>
      ) : (
        /* Pure 3D Canvas View */
        <VoxelScene
          voxels={voxels}
          isRevealed={isRevealed}
          senderName={gift.sender_name}
          recipientName={gift.recipient_name}
        />
      )}
    </div>
  );
}
