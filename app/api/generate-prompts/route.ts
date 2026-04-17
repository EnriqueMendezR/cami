import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

const responseSchema = z.object({
  prompts: z.array(
    z.object({
      scenario: z.string(),
      textOverlay: z.string(),
      fullPrompt: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const { type, language, count = 3 } = (await req.json()) as {
    type: 'website-sales' | 'act-of-endearment';
    language: 'english' | 'spanish';
    count?: number;
  };
  const n = Math.max(1, Math.min(10, count));

  const skillFile =
    type === 'website-sales' ? 'website-sales.md' : 'act-of-endearment.md';
  const skillContent = readFileSync(
    join(process.cwd(), 'ai/skills', skillFile),
    'utf-8'
  );

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: responseSchema,
    system: skillContent,
    prompt: `Generate exactly ${n} distinct Seedance 2.0 video prompts following the skill above. Use ${n} different scenarios from the scenario bank — vary them significantly. Language for all text overlays: ${language}. Return exactly ${n} items in the prompts array.`,
  });

  const prompts = result.object.prompts.slice(0, n);
  return NextResponse.json({ prompts });
}
