'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImageForUpload } from '@/lib/imageProcessing';
import { Upload, Sparkles, Check, Copy, AlertCircle, Image as ImageIcon, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file to convert into a 3D gift.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Client-side canvas compression & resize (140px max) for crisp facial features & adaptive 3D rendering
      const compressedBlob = await compressImageForUpload(file, 140);
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
      const storagePath = `gifts/${uniqueFileName}`;

      // 2. Upload to Supabase Storage Bucket 'gift-images'
      const { error: storageError } = await supabase.storage
        .from('gift-images')
        .upload(storagePath, compressedBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          `Storage upload error: ${storageError.message}. Make sure your Supabase credentials in .env.local are configured and the SQL table/bucket setup is complete.`
        );
      }

      // 3. Retrieve public url
      const { data: publicUrlData } = supabase.storage
        .from('gift-images')
        .getPublicUrl(storagePath);

      const imageUrl = publicUrlData.publicUrl;

      // 4. Insert row into PostgreSQL database
      const { data: dbData, error: dbError } = await supabase
        .from('gifts')
        .insert([
          {
            image_url: imageUrl,
            storage_path: storagePath,
            sender_name: senderName.trim() || 'A friend',
            recipient_name: recipientName.trim() || 'You',
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database record insert error: ${dbError.message}`);
      }

      const link = `${window.location.origin}/gift/${dbData.id}`;
      setGeneratedLink(link);
    } catch (err: unknown) {
      console.error('Error creating gift:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during gift processing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (generatedLink) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl glass-card border border-purple-500/30 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
        
        <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30 animate-bounce">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-black mb-2 text-white">Your 3D Voxel Gift is Ready! ✨</h2>
        <p className="text-slate-300 text-sm mb-8">
          We processed and stored your photo with lightweight 3D voxel parameters. Share this link with your friend to unwrap their surprise!
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-white/10 mb-8">
          <input
            type="text"
            readOnly
            value={generatedLink}
            className="w-full bg-transparent border-none text-slate-200 text-sm focus:outline-none px-2 font-mono truncate"
          />
          <button
            onClick={copyToClipboard}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
            }`}
          >
            {copied ? (
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
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href={generatedLink}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>Test Open Your Gift</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              setGeneratedLink(null);
              setFile(null);
              setPreviewUrl(null);
            }}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-white/10"
          >
            Create Another Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl glass-card border border-white/10 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Processing Error</p>
              <p className="mt-1 opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Drag & Drop Photo Picker */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
            1. Select Photo for 3D Voxel Conversion
          </label>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-3xl p-8 transition-all duration-300 bg-slate-900/40 hover:bg-purple-950/10 text-center group flex flex-col items-center justify-center min-h-[260px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-purple-500 shadow-xl shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white uppercase tracking-wider">
                    Change Photo
                  </div>
                </div>
                <p className="text-sm font-semibold text-purple-300">
                  {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)
                </p>
                <p className="text-xs text-slate-400">
                  ✨ Ready for 140px adaptive saliency grid (crisp face & body detail!)
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center max-w-sm">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                    Drag and drop your picture here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Or click to browse from your device. Best with portraits or high-contrast imagery!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sender and Recipient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              2. Recipient Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              3. Your Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sam"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-white/20"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>Compressing & Generating Voxel Gift...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 animate-bounce" />
              <span>Generate Shareable 3D Gift Link</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
