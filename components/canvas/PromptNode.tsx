'use client';

import { useState } from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  MarkerType,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import { fal } from '@fal-ai/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Pencil, X } from 'lucide-react';

export type PromptNodeData = Node<
  { scenario: string; textOverlay: string; fullPrompt: string },
  'promptNode'
>;

type Status = 'idle' | 'generating' | 'done';

const FAL_PRESETS = {
  resolution: '720p',
  duration: '4',
  aspect_ratio: '9:16',
  generate_audio: false,
} as const;

export function PromptNode({
  data,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<PromptNodeData>) {
  const [value, setValue] = useState(data.fullPrompt);
  const [status, setStatus] = useState<Status>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const { addEdges, setNodes, fitView } = useReactFlow();

  const handleGenerate = async () => {
    if (status !== 'idle') return;

    const generatingNodeId = `generating-${id}`;

    // Add the GeneratingNode
    setNodes((nds) => [
      ...nds,
      {
        id: generatingNodeId,
        type: 'generatingNode',
        position: { x: positionAbsoluteX, y: positionAbsoluteY + 380 },
        data: { scenario: data.scenario, statusMsg: 'In queue...' },
      },
    ]);

    // Add edge from this PromptNode to the GeneratingNode
    addEdges({
      id: `edge-generating-${id}`,
      source: id,
      target: generatingNodeId,
      style: { stroke: '#52525b', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
    });

    // Mark as generating immediately (hides the Generate button)
    setStatus('generating');
    setIsEditing(false);

    // Fit view to bring the new node into view
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 100);

    try {
      console.log('[fal] subscribing to endpoint, prompt node id:', id);
      const result = await fal.subscribe('bytedance/seedance-2.0/fast/text-to-video', {
        input: { prompt: value, ...FAL_PRESETS },
        onQueueUpdate(update) {
          console.log('[fal] queue update:', update);
          let newMsg = 'In queue...';
          if (update.status === 'IN_QUEUE') {
            const pos = (update as { position?: number }).position;
            newMsg = pos != null ? `In queue (#${pos})` : 'In queue...';
          } else if (update.status === 'IN_PROGRESS') {
            newMsg = 'Generating...';
          }
          setNodes((nds) =>
            nds.map((n) =>
              n.id === generatingNodeId
                ? { ...n, data: { ...n.data, statusMsg: newMsg } }
                : n
            )
          );
        },
      });

      console.log('[fal] raw result:', result);
      console.log('[fal] result.data:', result.data);

      const videoUrl = (result.data as { video: { url: string } }).video.url;
      console.log('[fal] extracted videoUrl:', videoUrl);

      // Replace the GeneratingNode with a GeneratedVideoNode in-place
      setNodes((nds) => {
        const found = nds.find((n) => n.id === generatingNodeId);
        console.log('[fal] generatingNodeId:', generatingNodeId, '| found in nodes:', !!found);
        return nds.map((n) =>
          n.id === generatingNodeId
            ? {
                id: n.id,
                type: 'generatedVideoNode',
                position: n.position,
                data: { videoUrl },
              }
            : n
        );
      });

      setStatus('done');

      setTimeout(() => {
        fitView({ padding: 0.2, duration: 600 });
      }, 100);
    } catch (err) {
      console.error('[fal] Video generation failed:', err);
      setStatus('idle');
      setNodes((nds) => nds.filter((n) => n.id !== generatingNodeId));
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-72 flex flex-col shadow-xl transition-all duration-500">
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
          <div className="flex items-center gap-1.5">
            {status === 'done' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {status === 'idle' && (
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                aria-label={isEditing ? 'Close edit mode' : 'Edit prompt'}
              >
                {isEditing ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Pencil className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-400 italic leading-relaxed">
          &ldquo;{data.textOverlay}&rdquo;
        </p>

        {isEditing ? (
          <textarea
            className="nodrag nowheel w-full text-xs text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 min-h-[120px] leading-relaxed"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <p className="text-zinc-400 text-xs leading-relaxed">
            {value}
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3">
        {status === 'idle' && (
          <Button
            size="sm"
            className="w-full text-xs font-medium cursor-pointer"
            onClick={handleGenerate}
          >
            Generate Video
          </Button>
        )}
        {status === 'generating' && (
          <div className="flex items-center justify-center gap-1.5 py-1">
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
            <span className="text-xs text-zinc-500">In progress...</span>
          </div>
        )}
        {status === 'done' && (
          <div className="flex items-center justify-center gap-1.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-medium">Video ready</span>
          </div>
        )}
      </div>
    </div>
  );
}
