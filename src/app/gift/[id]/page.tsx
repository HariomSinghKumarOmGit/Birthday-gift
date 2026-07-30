'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GiftViewer from '@/components/gift/GiftViewer';

export default function DynamicGiftPage() {
  const params = useParams();
  const giftId = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="w-full h-full min-h-screen">
      <GiftViewer giftId={giftId} />
    </div>
  );
}
