"use client";

import { useRef, useState } from "react";

interface InputData {
  description: string;
  platform: string;
  audience: string;
  goal: string;
}

interface Hook {
  id: number;
  category: string;
  hook_text: string;
}

interface HooksResponse {
  video_summary: string;
  hooks: Hook[];
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputData, setInputData] = useState<InputData>({
    description: "",
    platform: "",
    audience: "",
    goal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hooks, setHooks] = useState<HooksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function handleSubmit() {
    if (!inputData.description.trim()) {
      setError("Please describe your video before generating hooks.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setHooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(hook: Hook) {
    try {
      await navigator.clipboard.writeText(hook.hook_text);
      setCopiedId(hook.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or permission denied) — fail silently
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-6xl font-bold tracking-tight mb-12 text-white">
        cami
      </h1>

      {hooks === null && (
        <>
          {/* Video upload + description */}
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            <div
              className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-colors min-h-64 p-8 ${
                isDragging
                  ? "border-white bg-zinc-800"
                  : "border-zinc-600 bg-zinc-900 hover:border-zinc-400 hover:bg-zinc-800"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {videoFile ? (
                <div className="text-center">
                  <p className="text-zinc-300 text-sm font-medium break-all">{videoFile.name}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <button
                    className="mt-4 text-xs text-zinc-400 underline hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center pointer-events-none">
                  <svg
                    className="mx-auto mb-4 w-10 h-10 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-zinc-300 font-medium">Drop your video here</p>
                  <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-4 min-h-64">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Description
              </label>
              <textarea
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 resize-none outline-none text-sm leading-relaxed"
                placeholder="Describe your video..."
                value={inputData.description}
                onChange={(e) => setInputData({ ...inputData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="w-full max-w-4xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Platform <span className="text-zinc-600 normal-case font-normal">— optional</span>
              </label>
              <select
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500 appearance-none cursor-pointer"
                value={inputData.platform}
                onChange={(e) => setInputData({ ...inputData, platform: e.target.value })}
              >
                <option value="">Select platform</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Audience <span className="text-zinc-600 normal-case font-normal">— optional</span>
              </label>
              <input
                type="text"
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
                placeholder="e.g. Gen Z fitness enthusiasts"
                value={inputData.audience}
                onChange={(e) => setInputData({ ...inputData, audience: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Goal <span className="text-zinc-600 normal-case font-normal">— optional</span>
              </label>
              <input
                type="text"
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
                placeholder="e.g. Drive product page clicks"
                value={inputData.goal}
                onChange={(e) => setInputData({ ...inputData, goal: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="w-full max-w-4xl mt-6 flex flex-col items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                "Generate Hooks"
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </>
      )}

      {hooks !== null && (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Summary */}
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
              Video Summary
            </p>
            <p className="text-zinc-200 text-sm leading-relaxed">{hooks.video_summary}</p>
          </div>

          {/* Hook cards */}
          <div className="flex flex-col gap-4">
            {hooks.hooks.map((hook) => (
              <div
                key={hook.id}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-5 flex flex-col gap-3"
              >
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  {hook.category.replace("-", " ")}
                </span>
                <p className="text-zinc-100 text-xl font-medium leading-snug">
                  {hook.hook_text}
                </p>
                <button
                  onClick={() => handleCopy(hook)}
                  className="self-start px-4 py-1.5 rounded-lg border border-zinc-700 text-xs font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  {copiedId === hook.id ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Start over */}
          <div className="flex justify-center pb-4">
            <button
              onClick={() => { setHooks(null); setError(null); }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
