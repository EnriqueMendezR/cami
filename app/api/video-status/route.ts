import { fal } from '@fal-ai/client';
import { NextRequest, NextResponse } from 'next/server';

const FAL_KEY = process.env.FAL_KEY ?? process.env.FAL_AI_KEY ?? '';

const MODEL = 'bytedance/seedance-2.0/fast/text-to-video';

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get('requestId');
  if (!requestId) {
    return NextResponse.json({ error: 'requestId required' }, { status: 400 });
  }

  fal.config({ credentials: FAL_KEY });

  const status = await fal.queue.status(MODEL, {
    requestId,
    logs: false,
  });

  if (status.status === 'COMPLETED') {
    const { data } = await fal.queue.result(MODEL, { requestId });
    const videoUrl = (data as { video: { url: string } }).video.url;
    return NextResponse.json({ status: 'COMPLETED', videoUrl });
  }

  const position = (status as { position?: number }).position;
  return NextResponse.json({ status: status.status, position });
}
