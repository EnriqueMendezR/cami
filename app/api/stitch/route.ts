import fs from 'fs'
import { NextRequest } from 'next/server'
import { concatenateVideos, makeTmpOutputPath } from '@/lib/ffmpeg'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<Response> {
  let outputPath: string | undefined
  try {
    const { videoAPath, videoBPath }: { videoAPath?: string; videoBPath?: string } = await request.json()

    if (!videoAPath || !videoBPath) {
      return Response.json(
        { error: 'videoAPath and videoBPath are required' },
        { status: 400 }
      )
    }

    outputPath = makeTmpOutputPath()
    await concatenateVideos(videoAPath, videoBPath, outputPath)

    const buffer = fs.readFileSync(outputPath)
    return new Response(buffer, {
      headers: { 'Content-Type': 'video/mp4' },
    })
  } catch (error) {
    console.error('stitch error:', error)
    return Response.json({ error: 'Failed to stitch videos' }, { status: 500 })
  } finally {
    if (outputPath) {
      try { fs.unlinkSync(outputPath) } catch { /* best-effort cleanup */ }
    }
  }
}
