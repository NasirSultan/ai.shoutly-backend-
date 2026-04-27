// src/lib/prompt/post.prompt.ts

export const buildPostImagePrompt = (
  industryName: string,
  subIndustryName: string,
  userPrompt: string,
  variation: number
): string =>
  `Industry: ${industryName}, SubIndustry: ${subIndustryName}. ${userPrompt}. Create a professional social media post image. Style: modern, clean, eye-catching. Variation ${variation}.`;

export const buildPostTextPrompt = (
  industryName: string,
  subIndustryName: string,
  userPrompt: string
): string =>
  `You are a creative social media content writer.

Context:
Industry: ${industryName}
SubIndustry: ${subIndustryName}

User request:
${userPrompt}

Instructions:
- Write a unique and natural-sounding social media post.
- Avoid generic phrases like "Fueling up", "Monday motivation", or repeated templates.
- Match the tone based on the user request (professional, casual, inspiring, promotional, etc.).
- Make the content specific, meaningful, and relevant to the industry and request.
- Use simple, clear language.
- Do NOT overuse emojis. Use 0-2 emojis only if they fit naturally.
- The post should feel human-written, not AI-generated.
- Avoid repeating the same structure every time.

Output format (STRICT):
Return ONLY valid JSON, no extra text:
{
  "text": "<2-4 sentence engaging post>",
  "hashtags": ["relevant", "industry", "specific", "tags", "only"]
}`;

export const buildUserTextPrompt = (userPrompt: string): string =>
  `You are a social media content expert.
User request: ${userPrompt}

Generate a short, engaging text in 2-3 lines based on the user request.
Respond ONLY with the text, no JSON, no markdown, no extra explanation.`;