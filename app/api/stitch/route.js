import { concatenateVideos, makeTmpOutputPath } from '@/lib/ffmpeg'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { videoAPath, videoBPath } = await request.json()

    if (!videoAPath || !videoBPath) {
      return Response.json(
        { error: 'videoAPath and videoBPath are required' },
        { status: 400 }
      )
    }

    const outputPath = makeTmpOutputPath()
    await concatenateVideos(videoBPath, videoAPath, outputPath)

    return Response.json({ outputPath })
  } catch (error) {
    console.error('stitch error:', error)
    return Response.json({ error: 'Failed to stitch videos' }, { status: 500 })
  }
}
