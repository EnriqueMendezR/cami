import path from 'path'
import { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { r2, BUCKET } from '@/lib/r2'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData()

    const footageFile = formData.get('footage')
    const generatedFile = formData.get('generated')

    if (!(footageFile instanceof File) || !(generatedFile instanceof File)) {
      return Response.json(
        { error: 'Both "footage" and "generated" video files are required.' },
        { status: 400 }
      )
    }

    const timestamp = Date.now()

    const footageExt = path.extname(footageFile.name) || '.mp4'
    const generatedExt = path.extname(generatedFile.name) || '.mp4'

    const footageKey = `footage_${timestamp}${footageExt}`
    const generatedKey = `generated_${timestamp}${generatedExt}`

    const [footageBuffer, generatedBuffer] = await Promise.all([
      footageFile.arrayBuffer(),
      generatedFile.arrayBuffer(),
    ])

    console.log('[upload] uploading to R2:', footageKey, generatedKey)

    await Promise.all([
      r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: footageKey,
        Body: Buffer.from(footageBuffer),
        ContentType: footageFile.type || 'video/mp4',
      })),
      r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: generatedKey,
        Body: Buffer.from(generatedBuffer),
        ContentType: generatedFile.type || 'video/mp4',
      })),
    ])

    console.log('[upload] R2 upload complete')

    return Response.json({ footageKey, generatedKey })
  } catch (err) {
    console.error('[upload] POST failed:', err)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
