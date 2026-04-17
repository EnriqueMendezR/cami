'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type SkeletonNodeData = Node<Record<string, never>, 'skeletonNode'>;

export function SkeletonNode({ }: NodeProps<SkeletonNodeData>) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-72 p-4 space-y-3 shadow-xl">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
      <div className="h-3 bg-zinc-700 rounded-full animate-pulse w-1/3" />
      <div className="h-3 bg-zinc-700 rounded-full animate-pulse w-1/2 opacity-70" />
      <div className="space-y-2">
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse" />
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse opacity-80" />
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-5/6 opacity-60" />
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse opacity-70" />
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-4/6 opacity-50" />
      </div>
      <div className="h-8 bg-zinc-700 rounded-lg animate-pulse mt-2" />
    </div>
  );
}
