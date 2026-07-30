import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Boxes, ShieldCheck, Zap, Smartphone, Heart, Share2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 text-center max-w-5xl mx-auto space-y-8 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Next-Generation Shareable Gifting Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
          Surprise Friends With <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Interactive 3D Voxel Portraits
          </span>
        </h1>

        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Transform ordinary photos into mesmerizing 3D volumetric sculptures. Generate unique shareable links that unwrap with smooth GSAP animations directly on your friend&apos;s phone—no downloads needed!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/upload"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 shadow-2xl shadow-purple-500/35 hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300 border border-white/25 flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Create a Voxel Gift</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300 border border-white/10 shadow-xl flex items-center justify-center gap-2"
          >
            <Boxes className="w-5 h-5 text-indigo-400" />
            <span>Manage My Gifts</span>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How The <span className="text-purple-400">Pro-Architecture</span> Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Designed for blazing-fast mobile rendering and ultra-efficient database storage using Next.js & Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl glass-card border border-white/10 space-y-5 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="absolute top-6 right-6 font-mono text-3xl font-black text-white/10 group-hover:text-purple-500/30 transition-colors">
              01
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Upload & Compress</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You pick a photo on your laptop or phone. Our client-side canvas compresses it to an optimal ~75px grid before uploading to your Supabase bucket.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl glass-card border border-white/10 space-y-5 hover:border-pink-500/40 transition-all duration-300 group">
            <div className="absolute top-6 right-6 font-mono text-3xl font-black text-white/10 group-hover:text-pink-500/30 transition-colors">
              02
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Share Unique Link</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A secure PostgreSQL row creates a custom dynamic link (`/gift/[id]`). Copy and send it via WhatsApp, iMessage, or email instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl glass-card border border-white/10 space-y-5 hover:border-indigo-500/40 transition-all duration-300 group">
            <div className="absolute top-6 right-6 font-mono text-3xl font-black text-white/10 group-hover:text-indigo-500/30 transition-colors">
              03
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Unwrap & Reveal</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When opened, their smartphone GPU performs the 3D math on-the-fly, extracting RGB values into thousands of flying cubes with confetti!
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Footer Banner */}
      <section className="max-w-5xl mx-auto rounded-3xl glass-card p-8 border border-white/10 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 text-center space-y-6 shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-purple-300 font-bold uppercase text-xs tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full-Stack Supabase & React Three Fiber Architecture</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white">
          Ready to make someone feel special today?
        </h3>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          No database bloat, no heavy servers—just smart hardware acceleration and creative emotional gifting.
        </p>
        <div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/25 transition-all"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
            <span>Start Creating Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
