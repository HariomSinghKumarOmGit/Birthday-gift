'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GiftViewer from '@/components/gift/GiftViewer';

export default function DynamicGiftPage() {
  const params = useParams();
  const giftId = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="w-full min-h-screen pt-4">
      <GiftViewer giftId={giftId} />
    </div>
  );
}
