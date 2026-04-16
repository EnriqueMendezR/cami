import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const POSTIZ_BASE = 'https://api.postiz.com/public/v1'

const PLATFORM_TYPE = {
  tiktok: 'tiktok',
  instagram: 'instagram',
  'youtube-shorts': 'youtube',
}

export async function POST(request) {
  try {
    const { filePath, caption, platform, scheduledAt, tmpFiles } = await request.json()

    if (!filePath || !caption || !platform) {
      return Response.json(
        { error: 'filePath, caption, and platform are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.POSTIZ_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'POSTIZ_API_KEY is not configured' }, { status: 500 })
    }

    const integrationId = process.env.POSTIZ_INTEGRATION_ID
    if (!integrationId) {
      return Response.json({ error: 'POSTIZ_INTEGRATION_ID is not configured' }, { status: 500 })
    }

    // 1. Upload video file to Postiz
    const videoBuffer = fs.readFileSync(filePath)
    const blob = new Blob([videoBuffer], { type: 'video/mp4' })
    const form = new FormData()
    form.append('file', blob, path.basename(filePath))

    const uploadRes = await fetch(`${POSTIZ_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: apiKey },
      body: form,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}))
      return Response.json(
        { error: 'Postiz media upload failed', detail: err },
        { status: 502 }
      )
    }

    const { id: mediaId, path: mediaPath } = await uploadRes.json()

    // 2. Schedule or post immediately
    const platformType = PLATFORM_TYPE[platform] ?? platform
    const postPayload = {
      type: scheduledAt ? 'schedule' : 'now',
      ...(scheduledAt && { date: new Date(scheduledAt).toISOString() }),
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
          settings: { __type: platformType },
        },
      ],
    }

    const postRes = await fetch(`${POSTIZ_BASE}/posts`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    })

    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}))
      return Response.json(
        { error: 'Postiz post creation failed', detail: err },
        { status: 502 }
      )
    }

    const postData = await postRes.json()

    // 3. Clean up tmp files — non-fatal if a file is already gone
    const filesToDelete = Array.isArray(tmpFiles) && tmpFiles.length > 0
      ? tmpFiles
      : [filePath]

    for (const f of filesToDelete) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch (err) {
        console.warn(`Failed to delete tmp file ${f}:`, err.message)
      }
    }

    return Response.json({ success: true, post: postData })
  } catch (error) {
    console.error('post route error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
