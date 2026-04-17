'use client';

import { useEffect, useState } from 'react';
import {
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export type GeneratedVideoNodeData = Node<
  {
    videoUrl: string;
    scenario?: string;
    textOverlay?: string;
    originalVideoUrl?: string;
    isMerged?: boolean;
    r2Key?: string;
  },
  'generatedVideoNode'
>;

const PLATFORMS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
] as const;

type Platform = (typeof PLATFORMS)[number]['value'];
type PostStatus = 'idle' | 'posting' | 'posted' | 'error';
type MergeStatus = 'idle' | 'merging' | 'done' | 'error';

export function GeneratedVideoNode({
  data,
  id,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<GeneratedVideoNodeData>) {
  const { setNodes, addEdges, getNode } = useReactFlow();

  const [mergeStatus, setMergeStatus] = useState<MergeStatus>('idle');

  // Post UI state — only used when isMerged
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [caption, setCaption] = useState('');
  const [captionLoading, setCaptionLoading] = useState(true);
  const [postStatus, setPostStatus] = useState<PostStatus>('idle');
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    if (!data.isMerged) {
      setCaptionLoading(false);
      return;
    }
    const context = [data.scenario, data.textOverlay].filter(Boolean).join(' — ');
    fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, context: context || undefined }),
    })
      .then((r) => r.json())
      .then((d) => setCaption(d.caption ?? ''))
      .catch(() => setCaption(''))
      .finally(() => setCaptionLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePost() {
    if (!caption || postStatus === 'posting' || postStatus === 'posted') return;
    setPostStatus('posting');
    setPostError(null);
    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stitchedKey: data.r2Key ?? data.videoUrl?.split('/').pop(),
          caption,
          platform,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setPostError(body.error ?? 'Post failed');
        setPostStatus('error');
        return;
      }
      setPostStatus('posted');
    } catch {
      setPostError('Post failed. Please try again.');
      setPostStatus('error');
    }
  }

  async function handleMerge() {
    if (mergeStatus === 'merging' || mergeStatus === 'done' || !data.originalVideoUrl) return;
    setMergeStatus('merging');
    try {
      const res = await fetch('/api/leh-pipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falVideoUrl: data.videoUrl,
          originalVideoUrl: data.originalVideoUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[merge] leh-pipe error:', err);
        setMergeStatus('error');
        return;
      }

      const blob = await res.blob();

      // Upload to R2 so the server-side post route can fetch it
      const uploadForm = new FormData();
      uploadForm.append('video', blob, 'merged.mp4');
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      if (!uploadRes.ok) {
        console.error('[merge] R2 upload failed');
        setMergeStatus('error');
        return;
      }
      const { key: r2Key, url: mergedUrl } = await uploadRes.json() as { key: string; url: string };

      // Position merged node below current node, respecting group
      const currentNode = getNode(id);
      const parentId = currentNode?.parentId;
      const groupNode = parentId ? getNode(parentId) : null;
      const relX = groupNode ? positionAbsoluteX - groupNode.position.x : positionAbsoluteX;
      const relY = groupNode ? positionAbsoluteY - groupNode.position.y : positionAbsoluteY;

      const mergedNodeId = `merged-${id}`;
      setNodes((nds) => [
        ...nds,
        {
          id: mergedNodeId,
          type: 'generatedVideoNode',
          position: { x: relX, y: relY + 720 },
          ...(parentId ? { parentId } : {}),
          data: {
            videoUrl: mergedUrl,
            scenario: data.scenario,
            textOverlay: data.textOverlay,
            isMerged: true,
            r2Key,
          },
        },
      ]);

      addEdges({
        id: `edge-${mergedNodeId}`,
        source: id,
        target: mergedNodeId,
        style: { stroke: '#52525b', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
      });

      setMergeStatus('done');
    } catch (err) {
      console.error('[merge] failed:', err);
      setMergeStatus('error');
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden w-64 shadow-xl flex flex-col">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
      />
      {!data.isMerged && data.originalVideoUrl && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-zinc-500 !border-zinc-400 !w-3 !h-3"
        />
      )}

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

      <div className="flex flex-col gap-3 p-3">
        {/* FAL node: merge button only */}
        {!data.isMerged && data.originalVideoUrl && (
          <>
            <button
              type="button"
              onClick={handleMerge}
              disabled={mergeStatus === 'merging' || mergeStatus === 'done'}
              className="nodrag w-full rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {mergeStatus === 'merging' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Merging…
                </>
              ) : mergeStatus === 'done' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Merged
                </>
              ) : mergeStatus === 'error' ? (
                'Merge failed — retry'
              ) : (
                'Merge Vids'
              )}
            </button>
          </>
        )}

        {/* Merged node: post UI only */}
        {data.isMerged && (
          <>
            <div className="flex gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={`nodrag flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    platform === p.value
                      ? 'border-white bg-white text-zinc-900'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {captionLoading ? (
              <div className="flex items-center gap-1.5 py-1">
                <Loader2 className="w-3 h-3 text-zinc-500 animate-spin shrink-0" />
                <span className="text-xs text-zinc-500">Generating caption…</span>
              </div>
            ) : (
              <textarea
                className="nodrag nowheel w-full text-xs text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 min-h-[64px] leading-relaxed"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption…"
              />
            )}

            {postStatus === 'posted' ? (
              <div className="flex items-center justify-center gap-1.5 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">Posted!</span>
              </div>
            ) : (
              <>
                {postError && (
                  <p className="text-xs text-red-400 text-center">{postError}</p>
                )}
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={captionLoading || postStatus === 'posting'}
                  className="nodrag w-full rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {postStatus === 'posting' ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Posting…
                    </>
                  ) : (
                    'Approve & Post'
                  )}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
