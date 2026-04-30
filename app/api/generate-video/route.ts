import { fal } from '@fal-ai/client';
import { NextResponse } from 'next/server';

const FAL_KEY = process.env.FAL_KEY ?? process.env.FAL_AI_KEY ?? '';

const FAL_PRESETS = {
  resolution: '720p',
  duration: '4',
  aspect_ratio: '9:16',
  generate_audio: false,
} as const;

const MODEL = 'bytedance/seedance-2.0/fast/text-to-video';

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt: string };
  if (!prompt) {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 });
  }

  fal.config({ credentials: FAL_KEY });

  const { request_id } = await fal.queue.submit(MODEL, {
    input: { prompt, ...FAL_PRESETS },
  });

  return NextResponse.json({ requestId: request_id });
}
