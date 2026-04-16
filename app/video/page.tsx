'use client'

import { useState, useRef, ChangeEvent } from 'react'

const PLATFORMS = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram Reels', value: 'instagram' },
  { label: 'YouTube Shorts', value: 'youtube-shorts' },
]

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
      <span className="text-sm font-semibold text-zinc-300">{label}</span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900 hover:border-zinc-400 hover:bg-zinc-800 transition-colors cursor-pointer"
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
              className="mb-2 h-8 w-8 text-zinc-500"
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
            <span className="text-sm text-zinc-500">Click to upload video</span>
          </>
        )}
      </button>

      {slot && (
        <p className="truncate text-xs text-zinc-500" title={slot.file.name}>
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
  // Screen 1 state
  const [footage, setFootage] = useState<VideoSlot | null>(null)
  const [generated, setGenerated] = useState<VideoSlot | null>(null)
  const [isCombining, setIsCombining] = useState(false)
  const [combineError, setCombineError] = useState<string | null>(null)

  // Screen 2 state
  const [combinedVideoUrl, setCombinedVideoUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [platform, setPlatform] = useState('tiktok')
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now')
  const [scheduledAt, setScheduledAt] = useState('')

  function makeSlot(file: File): VideoSlot {
    return { file, previewUrl: URL.createObjectURL(file) }
  }

  const bothReady = footage !== null && generated !== null

  async function handleCombine() {
    if (!footage) return
    setIsCombining(true)
    setCombineError(null)
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, context: footage.file.name }),
      })
      const data = await res.json()
      setCaption(res.ok ? (data.caption ?? '') : '')
      // Use footage preview as combined video placeholder until stitch API is ready
      setCombinedVideoUrl(footage.previewUrl)
    } catch {
      setCombineError('Failed to generate caption. You can still edit it manually.')
      setCombinedVideoUrl(footage.previewUrl)
    } finally {
      setIsCombining(false)
    }
  }

  // ── Screen 2 ──────────────────────────────────────────────────────────────
  if (combinedVideoUrl !== null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-white">Review & Post</h1>

          {/* Combined video player */}
          <div className="w-full rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900">
            <video
              src={combinedVideoUrl}
              controls
              className="w-full max-h-96 object-contain"
              playsInline
            />
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500 resize-none"
              placeholder="Write your caption…"
            />
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 appearance-none cursor-pointer"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Post Now / Schedule toggle */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              When to Post
            </label>
            <div className="flex rounded-xl border border-zinc-700 bg-zinc-900 p-1 w-fit gap-1">
              {(['now', 'schedule'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setScheduleMode(mode)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    scheduleMode === mode
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {mode === 'now' ? 'Post Now' : 'Schedule'}
                </button>
              ))}
            </div>

            {scheduleMode === 'schedule' && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 [color-scheme:dark]"
              />
            )}
          </div>

          {/* Approve & Post */}
          <button
            type="button"
            disabled={scheduleMode === 'schedule' && !scheduledAt}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Approve &amp; Post
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCombinedVideoUrl(null)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Screen 1 ──────────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-white">Video Workshop</h1>

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
          disabled={!bothReady || isCombining}
          onClick={handleCombine}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          {isCombining ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Combining…
            </>
          ) : (
            'Combine Videos'
          )}
        </button>

        {combineError && (
          <p className="text-red-400 text-sm text-center">{combineError}</p>
        )}
      </div>
    </main>
  )
}
