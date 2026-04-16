'use client'

import { useState, useRef, ChangeEvent } from 'react'

interface VideoSlot {
  file: File
  previewUrl: string
}

function UploadBox({
  label,
  slot,
  onSelect,
}: {
  label: string
  slot: VideoSlot | null
  onSelect: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {slot ? (
          <video
            src={slot.previewUrl}
            className="h-full w-full rounded-xl object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <>
            <svg
              className="mb-2 h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm text-gray-500">Click to upload video</span>
          </>
        )}
      </button>

      {slot && (
        <p className="truncate text-xs text-gray-600" title={slot.file.name}>
          {slot.file.name}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

export default function VideoPage() {
  const [footage, setFootage] = useState<VideoSlot | null>(null)
  const [generated, setGenerated] = useState<VideoSlot | null>(null)

  function makeSlot(file: File): VideoSlot {
    return { file, previewUrl: URL.createObjectURL(file) }
  }

  const bothReady = footage !== null && generated !== null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Video Workshop</h1>

        <div className="flex flex-col gap-6 sm:flex-row">
          <UploadBox
            label="Your Footage"
            slot={footage}
            onSelect={(f) => setFootage(makeSlot(f))}
          />
          <UploadBox
            label="Generated Video"
            slot={generated}
            onSelect={(f) => setGenerated(makeSlot(f))}
          />
        </div>

        <button
          type="button"
          disabled={!bothReady}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Combine Videos
        </button>
      </div>
    </main>
  )
}
