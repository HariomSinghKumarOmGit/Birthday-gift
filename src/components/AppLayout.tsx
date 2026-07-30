'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGiftPage = pathname?.startsWith('/gift/');

  if (isGiftPage) {
    return (
      <div className="fixed inset-0 w-full h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
