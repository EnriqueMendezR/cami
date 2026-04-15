import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const hookContext = readFileSync(
  join(process.cwd(), "app/api/generate-hooks/hookcontext.md"),
  "utf-8"
);

export async function POST(request) {
  try {
    const body = await request.json();
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

Based on the description and context above, choose the 3 hook types from the instructions that would be most effective for this content and audience. Write one hook per chosen type.

Respond with valid JSON only — no markdown, no explanation. Use this exact shape:
{
  "video_summary": "<one sentence summary of the video>",
  "hooks": [
    { "id": 1, "category": "<hook type name>", "hook_text": "<hook>" },
    { "id": 2, "category": "<hook type name>", "hook_text": "<hook>" },
    { "id": 3, "category": "<hook type name>", "hook_text": "<hook>" }
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

    const result = JSON.parse(completion.choices[0].message.content);

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
