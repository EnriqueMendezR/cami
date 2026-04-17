import fs from 'fs'
import { NextRequest } from 'next/server'
import {
  downloadToTemp,
  probeVideo,
  concatenateSilentVideos,
  makeTmpOutputPath,
} from '@/lib/ffmpeg'

export const runtime = 'nodejs'

function getVideoStream(metadata: Awaited<ReturnType<typeof probeVideo>>) {
  return metadata.streams.find((s) => s.codec_type === 'video')
}

function is9x16(metadata: Awaited<ReturnType<typeof probeVideo>>) {
  const v = getVideoStream(metadata)
  if (!v || !v.width || !v.height) return false
  return v.width * 16 === v.height * 9
}

function hasAudio(metadata: Awaited<ReturnType<typeof probeVideo>>) {
  return metadata.streams.some((s) => s.codec_type === 'audio')
}

export async function POST(request: NextRequest): Promise<Response> {
  const tempFiles: string[] = []

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const { falVideoUrl, originalVideoUrl } = body as {
      falVideoUrl?: string
      originalVideoUrl?: string
    }

    if (!falVideoUrl || !originalVideoUrl) {
      return Response.json(
        { error: 'falVideoUrl and originalVideoUrl are required' },
        { status: 400 }
      )
    }

    // Download both videos in parallel
    const [falPath, originalPath] = await Promise.all([
      downloadToTemp(falVideoUrl, 'fal'),
      downloadToTemp(originalVideoUrl, 'original'),
    ])
    tempFiles.push(falPath, originalPath)

    const falMeta = await probeVideo(falPath)

    // Validate fal video is 9:16 (ffmpeg scales original to fit)
    if (!is9x16(falMeta)) {
      return Response.json({ error: 'fal video must be 9:16 aspect ratio' }, { status: 422 })
    }

    // Fal video should never have audio (generate_audio: false)
    if (hasAudio(falMeta)) {
      return Response.json({ error: 'fal video must have no audio track' }, { status: 422 })
    }
    // Original may have audio — ffmpeg strips it via -an

    // Concatenate: fal first, then original
    const outputPath = makeTmpOutputPath()
    tempFiles.push(outputPath)
    await concatenateSilentVideos(falPath, originalPath, outputPath)

    const buffer = fs.readFileSync(outputPath)
    return new Response(buffer, {
      headers: { 'Content-Type': 'video/mp4' },
    })
  } catch (error) {
    console.error('leh-pipe error:', error)
    return Response.json({ error: 'Pipeline failed' }, { status: 500 })
  } finally {
    for (const f of tempFiles) {
      try { fs.unlinkSync(f) } catch { /* best-effort cleanup */ }
    }
  }
}
