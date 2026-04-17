'use client';

import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavProps {
  onUploadClick: () => void;
}

export function BottomNav({ onUploadClick }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="pointer-events-auto bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-2xl">
        <Button
          onClick={onUploadClick}
          size="sm"
          className="rounded-full gap-2 text-sm font-medium cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </Button>
      </div>
    </div>
  );
}
