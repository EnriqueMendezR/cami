import OpenAI from "openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { NextRequest } from "next/server";

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const hookContext = readFileSync(join(__dirname, "hookcontext.md"), "utf-8");

const CATEGORIES = [
  "question",           // Direct Address / Intrigue / Question
  "shock",              // Shock / Surprise Hook
  "story",              // Story / Anecdote Teaser
  "problem-solution",   // Problem / Solution Setup
  "you-focused",        // You-Focused Appeal
];

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: {
      description?: string;
      platform?: string;
      audience?: string;
      goal?: string;
    } = await request.json();
    const { description, platform, audience, goal } = body;

    if (!description) {
      return Response.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const contextLines = [
      platform && `Platform: ${platform}`,
      audience && `Target audience: ${audience}`,
      goal && `Goal: ${goal}`,
    ]
      .filter(Boolean)
      .join("\n");

    const userMessage = `Video description: ${description}${contextLines ? `\n${contextLines}` : ""}

Choose the 3 hook types from the instructions above that best fit this content and audience. Write one hook per chosen type.

Rules:
- Each hook_text must be 12 words or fewer. Enforce this strictly — cut any hook that exceeds 12 words.
- Use only these category values (exact strings): ${CATEGORIES.join(", ")}
- Return valid JSON only. No markdown, no explanation.

{
  "video_summary": "<one sentence summary of the video>",
  "hooks": [
    { "id": 1, "category": "<category>", "hook_text": "<hook>" },
    { "id": 2, "category": "<category>", "hook_text": "<hook>" },
    { "id": 3, "category": "<category>", "hook_text": "<hook>" }
  ]
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert short-form video strategist. Follow these hook-writing instructions exactly:\n\n${hookContext}`,
        },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content ?? "{}");

    return Response.json({
      video_summary: result.video_summary,
      hooks: result.hooks,
    });
  } catch (error) {
    console.error("generate-hooks error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
