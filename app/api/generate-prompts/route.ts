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
  const { type, language } = (await req.json()) as {
    type: 'website-sales' | 'act-of-endearment';
    language: 'english' | 'spanish';
  };

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
    prompt: `Generate exactly 3 distinct Seedance 2.0 video prompts following the skill above. Use 3 different scenarios from the scenario bank — vary them significantly. Language for all text overlays: ${language}. Return exactly 3 items in the prompts array.`,
  });

  const prompts = result.object.prompts.slice(0, 3);
  return NextResponse.json({ prompts });
}
