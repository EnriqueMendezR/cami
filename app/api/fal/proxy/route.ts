import { route } from '@fal-ai/server-proxy/nextjs';

// server-proxy expects FAL_KEY — map FAL_AI_KEY if needed
if (!process.env.FAL_KEY && process.env.FAL_AI_KEY) {
  process.env.FAL_KEY = process.env.FAL_AI_KEY;
}

export const { GET, POST, PUT } = route;
