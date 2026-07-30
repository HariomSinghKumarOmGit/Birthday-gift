'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, PlusCircle, LayoutGrid, Sparkles, Menu, X, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Create Gift', href: '/upload', icon: PlusCircle },
    { label: 'My Dashboard', href: '/dashboard', icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/90 border-b border-white/10 shadow-lg shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
        >
          <div className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-all duration-300">
            <Boxes className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-indigo-300 transition-all duration-500">
              VoxelGift
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-indigo-400/80 -mt-1">
              3D Experience Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 group ${
                  isActive
                    ? 'text-white bg-white/10 shadow-inner border border-white/15 shadow-purple-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-300'
                    }`}
                  />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Desktop CTA Button */}
          <Link
            href="/upload"
            className="ml-2 items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/20"
          >
            <Sparkles className="w-4 h-4 animate-bounce" />
            <span>Create New Gift</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/upload"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-1 shadow-md shadow-purple-500/20 active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create</span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-purple-400" />
            ) : (
              <Menu className="w-6 h-6 text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 animate-fadeIn">
          <nav className="p-4 space-y-2 max-w-7xl mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-2xl text-base font-bold transition-all flex items-center gap-3.5 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </Link>
              );
            })}

            <div className="pt-2">
              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[50px] px-5 py-3.5 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2.5 active:scale-[0.99] transition-transform border border-white/20"
              >
                <Sparkles className="w-5 h-5 animate-bounce" />
                <span>Create New 3D Gift</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
