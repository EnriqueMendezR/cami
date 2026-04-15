"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Video upload */}
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

        {/* Text input */}
        <div className="flex-1 flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-4 min-h-64">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Prompt
          </label>
          <textarea
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 resize-none outline-none text-sm leading-relaxed"
            placeholder="Describe what you want to do with the video..."
          />
        </div>
      </div>
    </div>
  );
}
