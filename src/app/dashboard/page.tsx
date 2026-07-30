import React from 'react';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { LayoutGrid, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Creator Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Your Generated <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Gift Links</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your created 3D voxel experiences, copy links instantly, or remove outdated files.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 transition-all shrink-0 border border-white/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Gift</span>
        </Link>
      </div>

      {/* Main Grid Component */}
      <DashboardGrid />
    </div>
  );
}
