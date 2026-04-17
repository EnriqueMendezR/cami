'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Loader2, CheckCircle2 } from 'lucide-react';

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

function formatElapsed(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const SHIMMER_WIDTHS = ['100%', '80%', '95%', '70%', '88%'];

export function PromptNode({
  data,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<PromptNodeData>) {
  const [value, setValue] = useState(data.fullPrompt);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMsg, setStatusMsg] = useState('In queue...');
  const [elapsed, setElapsed] = useState(0);
  const isMounted = useRef(true);
  const { addNodes, addEdges } = useReactFlow();

  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    if (status !== 'generating') return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleGenerate = async () => {
    if (status !== 'idle') return;
    setStatus('generating');
    setStatusMsg('In queue...');

    try {
      const result = await fal.subscribe('bytedance/seedance-2.0/fast/text-to-video', {
        input: { prompt: value, ...FAL_PRESETS },
        onQueueUpdate(update) {
          if (!isMounted.current) return;
          if (update.status === 'IN_QUEUE') {
            const pos = (update as { position?: number }).position;
            setStatusMsg(pos != null ? `In queue (#${pos})` : 'In queue...');
          } else if (update.status === 'IN_PROGRESS') {
            setStatusMsg('Generating...');
          }
        },
      });

      if (!isMounted.current) return;

      const videoUrl = (result.data as { video: { url: string } }).video.url;
      const resultId = `generated-${id}`;

      addNodes({
        id: resultId,
        type: 'generatedVideoNode',
        position: { x: positionAbsoluteX, y: positionAbsoluteY + 400 },
        data: { videoUrl },
      });

      addEdges({
        id: `edge-generated-${id}`,
        source: id,
        target: resultId,
        style: { stroke: '#52525b', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
      });

      setStatus('done');
    } catch (err) {
      console.error('Video generation failed:', err);
      if (isMounted.current) setStatus('idle');
    }
  };

  const isGenerating = status === 'generating';

  return (
    <div
      className={`bg-zinc-900 rounded-xl w-72 flex flex-col shadow-xl transition-all duration-500 ${
        isGenerating
          ? 'border border-violet-500/40 shadow-violet-500/10 shadow-lg'
          : 'border border-zinc-700'
      }`}
    >
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
          {isGenerating && (
            <span className="text-[10px] text-violet-400 font-medium">{statusMsg}</span>
          )}
          {status === 'done' && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>

        <p className="text-xs text-zinc-400 italic leading-relaxed">
          &ldquo;{data.textOverlay}&rdquo;
        </p>

        {isGenerating ? (
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
        ) : (
          <textarea
            className="nodrag nowheel w-full text-xs text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 min-h-[120px] leading-relaxed"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
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
          <Button size="sm" className="w-full text-xs" disabled>
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
            Generating...
          </Button>
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
