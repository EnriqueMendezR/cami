'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { VideoIcon } from 'lucide-react';

export type VideoNodeData = Node<
  { videoUrl: string; fileName: string },
  'videoNode'
>;

export function VideoNode({ data }: NodeProps<VideoNodeData>) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden w-56 shadow-xl">
      {data.videoUrl ? (
        <video
          src={data.videoUrl}
          className="w-full aspect-video object-cover"
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-zinc-800">
          <VideoIcon className="w-8 h-8 text-zinc-600" />
        </div>
      )}
      <div className="px-3 py-2 text-xs text-zinc-400 truncate">
        {data.fileName}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
    </div>
  );
}
