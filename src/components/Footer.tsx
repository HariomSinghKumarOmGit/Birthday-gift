import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/60 backdrop-blur-md py-8 text-center text-sm text-slate-400 mt-auto z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>Powered by React Three Fiber, GSAP & Supabase</span>
        </div>
        <p className="text-xs text-slate-500">
          Crafted for unforgettable digital gifting moments ✨
        </p>
      </div>
    </footer>
  );
}
