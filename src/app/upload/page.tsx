import React from 'react';
import UploadForm from '@/components/upload/UploadForm';
import { Sparkles, Cpu, Zap, Lock } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Creator Gift Portal</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          Create an Interactive <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">3D Voxel Surprise</span>
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          Upload any photo. Our Pro-Architecture compresses it instantly in your browser before saving to Supabase, guaranteeing lightning-fast mobile voxel rendering for your friends!
        </p>
      </div>

      {/* Main Form Component */}
      <UploadForm />

      {/* Feature Explainer Mini Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Adaptive Saliency Compression</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Photos are compressed at 140px high definition. Our intelligent algorithm prioritizes high detail on faces and bodies while simplifying background voxels!
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">60 FPS On-The-Fly 3D Math</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When opened on a smartphone, React Three Fiber extracts RGB values and constructs thousands of cubes dynamically.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col items-start gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Complete Creator Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage or permanently delete generated links and stored photos instantly anytime from your Creator Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
