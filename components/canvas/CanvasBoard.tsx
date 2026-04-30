'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { VideoNode } from './VideoNode';
import { SkeletonNode } from './SkeletonNode';
import { PromptNode } from './PromptNode';
import { GeneratedVideoNode } from './GeneratedVideoNode';
import { GeneratingNode } from './GeneratingNode';
import { GroupNode } from './GroupNode';
import { BottomNav } from './BottomNav';
import { UploadModal, type UploadFormData } from './UploadModal';
import { useState } from 'react';


const nodeTypes = {
  videoNode: VideoNode,
  skeletonNode: SkeletonNode,
  promptNode: PromptNode,
  generatedVideoNode: GeneratedVideoNode,
  generatingNode: GeneratingNode,
  groupNode: GroupNode,
};

const NODE_SPACING = 340;
const BRANCH_Y = 400;
const GROUP_HEIGHT = 1700;
const GROUP_GAP = 80;

function computeGroupWidth(count: number) {
  return Math.max(600, count * 340 + 108);
}

function branchPositions(count: number, groupWidth: number) {
  const centerX = groupWidth / 2;
  const startX = centerX - ((count - 1) * NODE_SPACING) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * NODE_SPACING,
    y: BRANCH_Y,
  }));
}

type PromptResult = {
  scenario: string;
  textOverlay: string;
  fullPrompt: string;
};

function AutoFitView({ trigger }: { trigger: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (trigger === 0) return;
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 80);
    return () => clearTimeout(t);
  }, [trigger, fitView]);
  return null;
}

export default function CanvasBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);

  const handleSubmit = useCallback(
    async ({ language, type, file, count, autonomous }: UploadFormData) => {
      // Upload footage to R2 — modal waits on this before closing
      const uploadForm = new FormData();
      uploadForm.append('video', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
      if (!uploadRes.ok) {
        console.error('[canvas] footage upload failed');
        return;
      }
      const { url: videoUrl } = await uploadRes.json() as { key: string; url: string };

      // Rest of the work runs in the background after modal closes
      void (async () => {
      const groupWidth = computeGroupWidth(count);
      const groupId = `group-${Date.now()}`;
      const videoNodeId = `video-${groupId}`;
      const positions = branchPositions(count, groupWidth);

      // Build all new nodes inside setNodes so we read the latest snapshot for groupX
      setNodes((nds) => {
        const existingGroups = nds.filter((n) => n.type === 'groupNode');
        const groupX =
          existingGroups.length === 0
            ? 40
            : Math.max(
                ...existingGroups.map(
                  (g) => g.position.x + (Number(g.style?.width) || computeGroupWidth(3))
                )
              ) + GROUP_GAP;

        const groupNode: Node = {
          id: groupId,
          type: 'groupNode',
          position: { x: groupX, y: 0 },
          style: { width: groupWidth, height: GROUP_HEIGHT },
          data: { autonomous, stopped: false },
        };

        const videoNode: Node = {
          id: videoNodeId,
          type: 'videoNode',
          position: { x: groupWidth / 2 - 112, y: 80 },
          parentId: groupId,
          data: { videoUrl, fileName: file.name },
        };

        const skeletonNodes: Node[] = positions.map((pos, i) => ({
          id: `skeleton-${groupId}-${i}`,
          type: 'skeletonNode',
          position: pos,
          parentId: groupId,
          data: {},
        }));

        return [...nds, groupNode, videoNode, ...skeletonNodes];
      });

      const newEdges: Edge[] = positions.map((_, i) => ({
        id: `edge-${groupId}-${i}`,
        source: videoNodeId,
        target: `skeleton-${groupId}-${i}`,
        animated: true,
        style: { stroke: '#52525b', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
      }));

      setEdges((eds) => [...eds, ...newEdges]);
      setFitTrigger((n) => n + 1);

      try {
        const res = await fetch('/api/generate-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, language, count }),
        });

        if (!res.ok) throw new Error('Generation failed');

        const { prompts } = (await res.json()) as { prompts: PromptResult[] };

        prompts.forEach((prompt, i) => {
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === `skeleton-${groupId}-${i}`
                  ? {
                      ...n,
                      id: `prompt-${groupId}-${i}`,
                      type: 'promptNode',
                      data: {
                        scenario: prompt.scenario,
                        textOverlay: prompt.textOverlay,
                        fullPrompt: prompt.fullPrompt,
                        groupId,
                        autoStart: autonomous,
                        autoPost: autonomous,
                        originalVideoUrl: videoUrl,
                      },
                    }
                  : n
              )
            );
            setEdges((eds) =>
              eds.map((e) =>
                e.target === `skeleton-${groupId}-${i}`
                  ? {
                      ...e,
                      id: `edge-prompt-${groupId}-${i}`,
                      target: `prompt-${groupId}-${i}`,
                    }
                  : e
              )
            );
          }, i * 250);
        });
      } catch (err) {
        console.error(err);
      }
      })();
    },
    [setNodes, setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
        minZoom={0.3}
        maxZoom={2}
      >
        <AutoFitView trigger={fitTrigger} />
        <Background
          variant={BackgroundVariant.Dots}
          color="#27272a"
          gap={24}
          size={1.5}
        />
        <Controls className="!bg-zinc-900 !border-zinc-700 [&>button]:!bg-zinc-900 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800" />
      </ReactFlow>

      <BottomNav onUploadClick={() => setModalOpen(true)} />

      <UploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
