'use client';

import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { Square } from 'lucide-react';

export type GroupNodeData = Node<
  { autonomous: boolean; stopped: boolean },
  'groupNode'
>;

export function GroupNode({ id, data }: NodeProps<GroupNodeData>) {
  const { setNodes } = useReactFlow();

  const handleStop = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, stopped: true } } : n
      )
    );
  };

  const borderClass = data.autonomous
    ? data.stopped
      ? 'border-2 border-dotted border-blue-500/25'
      : 'border-2 border-dotted border-blue-500'
    : 'border border-zinc-700/40';

  return (
    <div
      className={`relative w-full h-full rounded-2xl ${borderClass} transition-colors duration-500`}
      style={{ overflow: 'visible' }}
    >
      {data.autonomous && !data.stopped && (
        <button
          onClick={handleStop}
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-colors cursor-pointer whitespace-nowrap"
          aria-label="Stop autonomous generation"
        >
          <Square className="w-3 h-3" />
          Stop
        </button>
      )}
    </div>
  );
}
