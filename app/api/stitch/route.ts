import fs from 'fs'
import os from 'os'
import path from 'path'
import { NextRequest } from 'next/server'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { concatenateVideos } from '@/lib/ffmpeg'
import { r2, BUCKET, r2PublicUrl } from '@/lib/r2'

export const runtime = 'nodejs'

async function downloadFromR2(key: string, label: string): Promise<string> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const bytes = await res.Body?.transformToByteArray()
  if (!bytes) throw new Error(`Empty body for R2 key: ${key}`)
  const ext = path.extname(key) || '.mp4'
  const localPath = path.join(os.tmpdir(), `stitch_${label}_${Date.now()}${ext}`)
  fs.writeFileSync(localPath, Buffer.from(bytes))
  return localPath
}

export async function POST(request: NextRequest): Promise<Response> {
  const tempFiles: string[] = []

  try {
    const { videoAKey, videoBKey }: { videoAKey?: string; videoBKey?: string } = await request.json()

    if (!videoAKey || !videoBKey) {
      return Response.json(
        { error: 'videoAKey and videoBKey are required' },
        { status: 400 }
      )
    }

    console.log('[stitch] downloading from R2:', videoAKey, videoBKey)

    const [pathA, pathB] = await Promise.all([
      downloadFromR2(videoAKey, 'a'),
      downloadFromR2(videoBKey, 'b'),
    ])
    tempFiles.push(pathA, pathB)

    const outputPath = path.join(os.tmpdir(), `stitched_${Date.now()}.mp4`)
    tempFiles.push(outputPath)

    console.log('[stitch] running ffmpeg concatenation')
    await concatenateVideos(pathA, pathB, outputPath)

    const stitchedBuffer = fs.readFileSync(outputPath)
    const stitchedKey = `stitched_${Date.now()}.mp4`

    console.log('[stitch] uploading result to R2:', stitchedKey)
    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: stitchedKey,
      Body: stitchedBuffer,
      ContentType: 'video/mp4',
    }))

    const stitchedUrl = r2PublicUrl(stitchedKey)
    console.log('[stitch] done, url:', stitchedUrl)

    return Response.json({ stitchedKey, stitchedUrl })
  } catch (error) {
    console.error('[stitch] error:', error)
    return Response.json({ error: 'Failed to stitch videos' }, { status: 500 })
  } finally {
    for (const f of tempFiles) {
      try { fs.unlinkSync(f) } catch { /* best-effort cleanup */ }
    }
  }
}
