import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit' 
});

export const metadata: Metadata = {
  title: 'VoxelGift | Shareable 3D Voxel Photo Gifting Experience',
  description: 'Transform cherished photos into interactive, shareable 3D voxel art gifts that reveal with beautiful GSAP animations directly on any browser or phone.',
  openGraph: {
    title: 'VoxelGift | Shareable 3D Voxel Photo Gifting Experience',
    description: 'Surprise friends with an interactive 3D Voxel portrait generated from your favorite photos.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,50,190,0.18),rgba(255,255,255,0))] selection:bg-purple-500/30 selection:text-purple-200">
        <div className="flex flex-col min-h-screen relative overflow-x-hidden">
          <Navbar />
          <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
            {children}
          </main>
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
        </div>
      </body>
    </html>
  );
}
