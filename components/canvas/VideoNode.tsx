'use client';

import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { VideoIcon, Trash2 } from 'lucide-react';

export type VideoNodeData = Node<
  { videoUrl: string; fileName: string },
  'videoNode'
>;

export function VideoNode({ id, data, parentId }: NodeProps<VideoNodeData>) {
  const { getNodes, setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    const groupId = parentId;
    if (!groupId) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      return;
    }
    const clusterIds = new Set(
      getNodes()
        .filter((n) => n.id === groupId || n.parentId === groupId)
        .map((n) => n.id)
    );
    setNodes((nds) => nds.filter((n) => !clusterIds.has(n.id)));
    setEdges((eds) =>
      eds.filter((e) => !clusterIds.has(e.source) && !clusterIds.has(e.target))
    );
  };

  return (
    <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl overflow-visible w-56 shadow-xl">
      <div className="overflow-hidden rounded-xl">
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
      </div>
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-600 hover:bg-zinc-700 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer text-zinc-400"
        aria-label="Delete cluster"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
    </div>
  );
}
