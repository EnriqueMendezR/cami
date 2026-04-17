'use client';

import { useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { X, Square } from 'lucide-react';

export type GroupNodeData = Node<
  { autonomous: boolean; stopped: boolean },
  'groupNode'
>;

export function GroupNode({ id, data }: NodeProps<GroupNodeData>) {
  const { getNodes, setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    const childIds = new Set(
      getNodes()
        .filter((n) => n.parentId === id)
        .map((n) => n.id)
    );
    childIds.add(id);
    setNodes((nds) => nds.filter((n) => !childIds.has(n.id)));
    setEdges((eds) =>
      eds.filter((e) => !childIds.has(e.source) && !childIds.has(e.target))
    );
  };

  const handleStop = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, stopped: true } } : n
      )
    );
  };

  const borderClass = data.autonomous
    ? data.stopped
      ? 'border-blue-500/25'
      : 'border-blue-500'
    : 'border-zinc-700/40';

  return (
    <div
      className={`relative w-full h-full rounded-2xl border-2 ${borderClass} transition-colors duration-500`}
      style={{ overflow: 'visible' }}
    >
      <button
        onClick={handleDelete}
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Delete cluster"
      >
        <X className="w-3 h-3 text-zinc-300" />
      </button>

      {data.autonomous && !data.stopped && (
        <button
          onClick={handleStop}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition-colors cursor-pointer whitespace-nowrap"
          aria-label="Stop autonomous generation"
        >
          <Square className="w-3 h-3" />
          Stop
        </button>
      )}
    </div>
  );
}
