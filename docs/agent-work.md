# Canvas — Video Prompt Generation

## What was built

New route `/canvas` — a full-screen node-based canvas where users upload a video, fill out a form, and get 3 AI-generated Seedance 2.0 video prompts branching out as editable nodes.

---

## Files created

### Page & API
- `app/canvas/page.tsx` — Client component wrapping CanvasBoard with `dynamic` + `ssr: false` (required for React Flow in Next.js 16)
- `app/api/generate-prompts/route.ts` — POST endpoint; reads the matching skill MD, calls `claude-sonnet-4-6` via Vercel AI SDK `generateObject`, returns 3 prompts

### Canvas components (`components/canvas/`)
- `CanvasBoard.tsx` — Main orchestrator: all state, API call, node creation, fit-view logic
- `VideoNode.tsx` — Displays uploaded video preview + filename; source handle at bottom
- `SkeletonNode.tsx` — Animated pulsing placeholder shown while Claude generates
- `PromptNode.tsx` — Editable textarea with scenario label + text overlay + "Generate Video" footer button
- `BottomNav.tsx` — Frosted glass fixed bottom-center bar with Upload Video button
- `UploadModal.tsx` — Shadcn Dialog: file input (video/*), Language toggle (English/Spanish), Type toggle (Website Sales / Act of Endearment)

---

## Dependencies added
- `@xyflow/react` v12 — node canvas with drag, zoom, pan, custom node types
- `ai` v6 — Vercel AI SDK
- `@ai-sdk/anthropic` — Anthropic provider for Vercel AI SDK
- `shadcn` — initialized with Tailwind v4; Dialog and Button components added

---

## How it works

1. User opens `/canvas` — empty dark canvas + bottom nav
2. Clicks **Upload Video** → modal opens
3. Selects a video file, picks Language and Type, clicks **Generate Prompts**
4. Modal closes; a VideoNode appears center-canvas with 3 SkeletonNodes branching below, connected by animated edges
5. `POST /api/generate-prompts` is called with `{ type, language }`
6. API reads `ai/skills/website-sales.md` or `ai/skills/act-of-endearment.md` as the system prompt
7. Claude returns 3 prompts `{ scenario, textOverlay, fullPrompt }`
8. Skeleton nodes are replaced by PromptNodes staggered 250ms apart
9. Each PromptNode has an editable textarea and a **Generate Video** button (not yet wired)

---

## How skills are used

The skill MD files are passed as the `system` prompt to Claude. They contain the scenario bank, text overlay formats, prompt templates, and language handling rules. Claude follows them to generate varied, on-format Seedance 2.0 prompts.

Tools were considered but are not appropriate here — the skills are creative templates, not actions. Tools will make sense when the **Generate Video** button is wired up to the Higgsfield/Seedance API.

---

## Video storage

The uploaded video is held in browser memory only as a blob URL (`URL.createObjectURL`). Nothing is uploaded to a server. When the Generate Video flow is built, the video will need to be uploaded and given a real URL for Seedance to reference.

---

## Bug fix — Video generation result not displaying (`PromptNode.tsx`)

**Symptom:** fal.ai generation completed and returned a valid video URL, but the canvas still showed the `GeneratingNode` (spinner/shimmer state) — the video never appeared.

**Root cause:** `PromptNode` was using an `isMounted` ref pattern to guard `setNodes` after the 2-minute async generation. During that wait, the component unmounted and remounted (triggered by the `onQueueUpdate → setNodes → onNodesChange → CanvasBoard re-render` cycle in React Flow v12 controlled mode). The cleanup effect set `isMounted.current = false`, and the success path bailed out early with `return`, so the `GeneratingNode` was never replaced.

**Fix:** Removed the `isMounted` ref entirely. `setNodes`, `addEdges`, and `fitView` from `useReactFlow()` operate on the React Flow store — they are safe to call regardless of whether the originating node component is mounted. Only `useState` setters need the isMounted guard, and React 18 silently ignores those on unmounted components anyway.
