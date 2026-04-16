import fs from 'fs'

export const runtime = 'nodejs'

const POSTIZ_BASE = 'https://api.postiz.com/public/v1'

const PLATFORM_TYPE = {
  tiktok: 'tiktok',
  instagram: 'instagram',
  'youtube-shorts': 'youtube',
}

export async function POST(request) {
  console.log('[post] route invoked')
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const caption = formData.get('caption')
    const platform = formData.get('platform')
    const scheduledAt = formData.get('scheduledAt') || undefined
    const tmpFilesRaw = formData.get('tmpFiles')
    const tmpFiles = tmpFilesRaw ? JSON.parse(tmpFilesRaw) : []

    console.log('[post] received fields:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      caption: caption?.slice(0, 80),
      platform,
      scheduledAt,
      tmpFiles,
    })

    if (!file || !caption || !platform) {
      console.error('[post] missing required fields — file:', !!file, 'caption:', !!caption, 'platform:', !!platform)
      return Response.json(
        { error: 'file, caption, and platform are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.POSTIZ_API_KEY
    if (!apiKey) {
      console.error('[post] POSTIZ_API_KEY is not set')
      return Response.json({ error: 'POSTIZ_API_KEY is not configured' }, { status: 500 })
    }

    const integrationId = process.env.POSTIZ_INTEGRATION_ID
    if (!integrationId) {
      console.error('[post] POSTIZ_INTEGRATION_ID is not set')
      return Response.json({ error: 'POSTIZ_INTEGRATION_ID is not configured' }, { status: 500 })
    }

    console.log('[post] using integrationId:', integrationId)

    // 1. Upload video file to Postiz
    const form = new FormData()
    form.append('file', file, 'stitched.mp4')

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

    // 2. Schedule or post immediately
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

    // 3. Clean up tmp files — non-fatal if a file is already gone
    for (const f of tmpFiles) {
      try {
        if (fs.existsSync(f)) fs.unlinkSync(f)
      } catch (err) {
        console.warn(`[post] failed to delete tmp file ${f}:`, err.message)
      }
    }

    return Response.json({ success: true, post: postData })
  } catch (error) {
    console.error('[post] unhandled error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
