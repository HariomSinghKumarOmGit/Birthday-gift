'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Boxes, PlusCircle, LayoutGrid, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Create Gift', href: '/upload', icon: PlusCircle },
    { label: 'My Dashboard', href: '/dashboard', icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-lg shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-all duration-300">
            <Boxes className="w-6 h-6 text-white transform group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-indigo-300 transition-all duration-500">
              VoxelGift
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400/80 -mt-1">
              3D Experience Engine
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
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

          {/* CTA Button */}
          <Link
            href="/upload"
            className="hidden md:flex ml-2 items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/20"
          >
            <Sparkles className="w-4 h-4 animate-bounce" />
            <span>Create New Gift</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
