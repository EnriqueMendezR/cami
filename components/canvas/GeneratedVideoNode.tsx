'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type GeneratedVideoNodeData = Node<
  { videoUrl: string },
  'generatedVideoNode'
>;

export function GeneratedVideoNode({ data }: NodeProps<GeneratedVideoNodeData>) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden w-52 shadow-xl">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
      <video
        src={data.videoUrl}
        className="w-full"
        style={{ aspectRatio: '9/16' }}
        autoPlay
        muted
        loop
        playsInline
        controls
      />
    </div>
  );
}
