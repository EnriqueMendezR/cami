import { NextRequest } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { r2, BUCKET } from '@/lib/r2'

export const runtime = 'nodejs'

const POSTIZ_BASE = 'https://api.postiz.com/public/v1'

const PLATFORM_TYPE: Record<string, string> = {
  tiktok: 'tiktok',
  instagram: 'instagram',
  'youtube-shorts': 'youtube',
}

export async function POST(request: NextRequest): Promise<Response> {
  console.log('[post] route invoked')
  try {
    const body: {
      stitchedKey?: string
      caption?: string
      platform?: string
      scheduledAt?: string
    } = await request.json()

    const { stitchedKey, caption, platform, scheduledAt } = body

    console.log('[post] received fields:', {
      stitchedKey,
      caption: caption ? caption.slice(0, 80) : undefined,
      platform,
      scheduledAt,
    })

    if (!stitchedKey || !caption || !platform) {
      console.error('[post] missing required fields — stitchedKey:', !!stitchedKey, 'caption:', !!caption, 'platform:', !!platform)
      return Response.json(
        { error: 'stitchedKey, caption, and platform are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.POSTIZ_API_KEY
    if (!apiKey) {
      console.error('[post] POSTIZ_API_KEY is not set')
      return Response.json({ error: 'POSTIZ_API_KEY is not configured' }, { status: 500 })
    }

    const INTEGRATION_IDS: Record<string, string | undefined> = {
      instagram: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID,
      tiktok: process.env.POSTIZ_TIKTOK_INTEGRATION_ID,
    }

    const integrationId = INTEGRATION_IDS[platform]
    if (!integrationId) {
      console.error('[post] no integration ID configured for platform:', platform)
      return Response.json({ error: `No integration ID configured for platform: ${platform}` }, { status: 500 })
    }

    console.log('[post] using integrationId:', integrationId, 'for platform:', platform)

    // 1. Download stitched video from R2
    console.log('[post] downloading stitched video from R2:', stitchedKey)
    const r2Res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: stitchedKey }))
    const videoBytes = await r2Res.Body?.transformToByteArray()
    if (!videoBytes) {
      return Response.json({ error: 'Failed to retrieve video from R2' }, { status: 500 })
    }

    // 2. Upload video file to Postiz
    const form = new FormData()
    form.append('file', new Blob([Buffer.from(videoBytes)], { type: 'video/mp4' }), 'stitched.mp4')

    console.log('[post] uploading media to Postiz...')
    const uploadRes = await fetch(`${POSTIZ_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: apiKey },
      body: form,
    })

    console.log('[post] upload response status:', uploadRes.status)
    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}))
      console.error('[post] Postiz media upload failed:', uploadRes.status, JSON.stringify(err))
      return Response.json(
        { error: 'Postiz media upload failed', detail: err },
        { status: 502 }
      )
    }

    const uploadData = await uploadRes.json()
    console.log('[post] upload success, mediaId:', uploadData.id, 'mediaPath:', uploadData.path)
    const { id: mediaId, path: mediaPath } = uploadData

    // 3. Schedule or post immediately
    const platformType = PLATFORM_TYPE[platform] ?? platform
    const postPayload = {
      type: scheduledAt ? 'schedule' : 'now',
      date: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      shortLink: false,
      tags: [],
      posts: [
        {
          integration: { id: integrationId },
          value: [
            {
              content: caption,
              image: [{ id: mediaId, path: mediaPath }],
            },
          ],
          settings: { __type: platformType, post_type: 'post' },
        },
      ],
    }

    console.log('[post] sending post payload to Postiz:', JSON.stringify(postPayload, null, 2))
    const postRes = await fetch(`${POSTIZ_BASE}/posts`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    })

    console.log('[post] post creation response status:', postRes.status)
    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}))
      console.error('[post] Postiz post creation failed:', postRes.status, JSON.stringify(err))
      return Response.json(
        { error: 'Postiz post creation failed', detail: err },
        { status: 502 }
      )
    }

    const postData = await postRes.json()
    console.log('[post] post created successfully:', JSON.stringify(postData))

    return Response.json({ success: true, post: postData })
  } catch (error) {
    console.error('[post] unhandled error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
