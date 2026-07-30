'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift } from '@/types/gift';
import { Trash2, ExternalLink, Copy, Check, AlertCircle, RefreshCw, Box, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardGrid() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Deletion modal state
  const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(`Database fetch error: ${dbError.message}. Ensure your .env.local credentials and tables are set up.`);
      }

      setGifts(data as Gift[] || []);
    } catch (err: unknown) {
      console.error('Error fetching gifts:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load created gifts.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGifts();
  }, []);

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/gift/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const confirmDelete = async () => {
    if (!giftToDelete) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      // 1. Delete image file from Supabase Storage Bucket 'gift-images' using storage_path
      if (giftToDelete.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('gift-images')
          .remove([giftToDelete.storage_path]);
        
        if (storageError) {
          console.warn('Storage deletion warning:', storageError.message);
        }
      }

      // 2. Delete database row from PostgreSQL 'gifts' table
      const { error: dbError } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftToDelete.id);

      if (dbError) {
        throw new Error(`Database removal error: ${dbError.message}`);
      }

      // 3. Remove from UI state
      setGifts((prev) => prev.filter((g) => g.id !== giftToDelete.id));
      setGiftToDelete(null);
    } catch (err: unknown) {
      console.error('Deletion failed:', err);
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('An unexpected error occurred during deletion.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] w-full max-w-4xl mx-auto rounded-3xl glass-card flex flex-col items-center justify-center p-12 border border-white/10 text-center shadow-xl space-y-4">
        <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading your created gifts from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Could not fetch gifts</p>
            <p className="mt-1 opacity-90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && gifts.length === 0 && (
        <div className="min-h-[360px] max-w-2xl mx-auto rounded-3xl glass-card border border-white/10 p-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Box className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">No Gift Links Generated Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              You haven&apos;t generated any shareable 3D Voxel links yet. Get started by transforming your first photo!
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your First Gift</span>
          </Link>
        </div>
      )}

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="rounded-3xl glass-card glass-card-hover border border-white/10 overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-lg"
          >
            <div>
              {/* Image Preview Header */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden border-b border-white/10">
                <img
                  src={gift.image_url}
                  alt="Voxel Gift Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium text-slate-200">
                  <span className="truncate max-w-[180px] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    To: <strong className="text-purple-300">{gift.recipient_name || 'Friend'}</strong>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {new Date(gift.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>From: <strong className="text-white">{gift.sender_name || 'Creator'}</strong></span>
                  <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    ID: {gift.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Action Controls */}
            <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => copyLink(gift.id)}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                  copiedId === gift.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-500/30'
                }`}
              >
                {copiedId === gift.id ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <Link
                href={`/gift/${gift.id}`}
                target="_blank"
                title="View Gift on Live URL"
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/10 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setGiftToDelete(gift)}
                title="Delete this gift experience"
                className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all border border-rose-500/20 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deletion Confirmation Modal */}
      {giftToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card border border-rose-500/30 shadow-2xl space-y-5 sm:space-y-6 text-center max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">Delete Gift Link?</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                This action will permanently delete the uploaded photo from Supabase Storage and remove the link record from PostgreSQL.
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {deleteError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={deleting}
                onClick={() => setGiftToDelete(null)}
                className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-white/10 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
