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
import { BottomNav } from './BottomNav';
import { UploadModal, type UploadFormData } from './UploadModal';
import { useState } from 'react';

const nodeTypes = {
  videoNode: VideoNode,
  skeletonNode: SkeletonNode,
  promptNode: PromptNode,
};

const VIDEO_NODE_ID = 'video-0';

const BRANCH_POSITIONS = [
  { x: 30, y: 400 },
  { x: 370, y: 400 },
  { x: 710, y: 400 },
];

type PromptResult = {
  scenario: string;
  textOverlay: string;
  fullPrompt: string;
};

function buildEdge(targetId: string, index: number): Edge {
  return {
    id: `edge-${index}`,
    source: VIDEO_NODE_ID,
    target: targetId,
    animated: true,
    style: { stroke: '#52525b', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
  };
}

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
    async ({ language, type, file }: UploadFormData) => {
      const videoUrl = URL.createObjectURL(file);

      const videoNode: Node = {
        id: VIDEO_NODE_ID,
        type: 'videoNode',
        position: { x: 390, y: 80 },
        data: { videoUrl, fileName: file.name },
      };

      const skeletonNodes: Node[] = BRANCH_POSITIONS.map((pos, i) => ({
        id: `skeleton-${i}`,
        type: 'skeletonNode',
        position: pos,
        data: {},
      }));

      const newEdges: Edge[] = BRANCH_POSITIONS.map((_, i) =>
        buildEdge(`skeleton-${i}`, i)
      );

      setNodes([videoNode, ...skeletonNodes]);
      setEdges(newEdges);
      setFitTrigger((n) => n + 1);

      try {
        const res = await fetch('/api/generate-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, language }),
        });

        if (!res.ok) throw new Error('Generation failed');

        const { prompts } = (await res.json()) as { prompts: PromptResult[] };

        prompts.forEach((prompt, i) => {
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === `skeleton-${i}`
                  ? {
                      ...n,
                      id: `prompt-${i}`,
                      type: 'promptNode',
                      data: {
                        scenario: prompt.scenario,
                        textOverlay: prompt.textOverlay,
                        fullPrompt: prompt.fullPrompt,
                      },
                    }
                  : n
              )
            );
            setEdges((eds) =>
              eds.map((e) =>
                e.target === `skeleton-${i}`
                  ? { ...e, id: `edge-prompt-${i}`, target: `prompt-${i}` }
                  : e
              )
            );
          }, i * 250);
        });
      } catch (err) {
        console.error(err);
      }
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
