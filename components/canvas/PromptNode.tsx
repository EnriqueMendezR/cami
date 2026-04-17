'use client';

import { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';

export type PromptNodeData = Node<
  { scenario: string; textOverlay: string; fullPrompt: string },
  'promptNode'
>;

export function PromptNode({ data }: NodeProps<PromptNodeData>) {
  const [value, setValue] = useState(data.fullPrompt);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-72 flex flex-col shadow-xl">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />

      <div className="px-4 pt-4 pb-3 flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {data.scenario}
        </span>
        <p className="text-xs text-zinc-400 italic leading-relaxed">
          &ldquo;{data.textOverlay}&rdquo;
        </p>
        <textarea
          className="nodrag nowheel w-full text-xs text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 min-h-[120px] leading-relaxed"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div className="border-t border-zinc-800 p-3">
        <Button size="sm" className="w-full text-xs font-medium cursor-pointer">
          Generate Video
        </Button>
      </div>
    </div>
  );
}
