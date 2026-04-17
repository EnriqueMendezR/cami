'use client';

import dynamic from 'next/dynamic';

const CanvasBoard = dynamic(
  () => import('@/components/canvas/CanvasBoard'),
  { ssr: false }
);

export default function CanvasPage() {
  return (
    <div className="w-screen h-screen bg-zinc-950">
      <CanvasBoard />
    </div>
  );
}
