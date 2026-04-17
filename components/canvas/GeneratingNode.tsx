'use client';

import { useEffect, useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type GeneratingNodeData = Node<
  { scenario: string; statusMsg: string },
  'generatingNode'
>;

function formatElapsed(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const SHIMMER_WIDTHS = ['100%', '80%', '95%', '70%', '88%'];

export function GeneratingNode({ data }: NodeProps<GeneratingNodeData>) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 border border-violet-500/40 shadow-violet-500/10 shadow-lg rounded-xl w-72 flex flex-col">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />

      <div className="px-4 pt-4 pb-3 flex flex-col gap-2">
        {/* Header row */}
        <div className="flex items-center justify-between min-h-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {data.scenario}
          </span>
          <span className="text-[10px] text-violet-400 font-medium">{data.statusMsg}</span>
        </div>

        {/* Shimmer bars */}
        <div className="space-y-2 py-1">
          {SHIMMER_WIDTHS.map((w, i) => (
            <div
              key={i}
              className="h-2 bg-zinc-700 rounded-full animate-pulse"
              style={{ width: w, animationDelay: `${i * 120}ms` }}
            />
          ))}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
              <span className="text-xs text-zinc-500">~2 min</span>
            </div>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          </div>
          <div className="h-px bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full w-1/3 bg-violet-500/60 rounded-full"
              style={{ animation: 'slide-progress 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <Button size="sm" className="w-full text-xs" disabled>
          <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          Generating...
        </Button>
      </div>
    </div>
  );
}
