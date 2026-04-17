import OpenAI from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  tiktok:
    "Write a TikTok caption under 150 characters. Include 3–5 relevant hashtags. Keep the tone casual and punchy.",
  instagram:
    "Write an Instagram caption under 150 characters. Include 3–5 relevant hashtags. Keep the tone engaging and on-brand.",
  "youtube-shorts":
    "Write a YouTube Shorts description as one full, descriptive sentence. No hashtags. Make it clear and enticing for the viewer.",
};

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: { platform?: string; context?: string } = await request.json();
    const { platform, context } = body;

    if (!platform) {
      return Response.json(
        { error: "platform is required" },
        { status: 400 }
      );
    }

    const instructions = PLATFORM_INSTRUCTIONS[platform.toLowerCase()];

    if (!instructions) {
      return Response.json(
        { error: `unsupported platform: ${platform}. Use tiktok, instagram, or youtube-shorts.` },
        { status: 400 }
      );
    }

    const userMessage = [
      instructions,
      context ? `Video context: ${context}` : "No additional context provided.",
      "",
      "Return valid JSON only. No markdown, no explanation.",
      '{ "caption": "<caption text>" }',
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert social media copywriter who writes short, high-performing captions for viral short-form video content.",
        },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content ?? "{}");

    return Response.json({ caption: result.caption });
  } catch (error) {
    console.error("generate-caption error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
