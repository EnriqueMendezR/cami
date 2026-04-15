import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // TODO: build prompt and call GPT-4o
    // Placeholder response
    return Response.json({
      video_summary: "Placeholder summary",
      hooks: [
        {
          id: 1,
          category: "placeholder",
          hook_text: "Placeholder hook text",
        },
      ],
    });
  } catch (error) {
    console.error("generate-hooks error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
