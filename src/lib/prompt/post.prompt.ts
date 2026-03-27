// src/lib/prompt/postgenerate/post.prompt.ts

export const buildPostImagePrompt = (
  industryName: string,
  subIndustryName: string,
  userPrompt: string,
  variation: number
): string =>
  `Industry: ${industryName}, SubIndustry: ${subIndustryName}. ${userPrompt}. Create a professional social media post image. Style: modern, clean, eye-catching. Variation ${variation}.`

export const buildPostTextPrompt = (
  industryName: string,
  subIndustryName: string,
  userPrompt: string
): string =>
  `You are a social media content expert.
Context: Industry: ${industryName}, SubIndustry: ${subIndustryName}
User request: ${userPrompt}

Generate a social media post. Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "text": "<engaging post caption, 2-4 sentences>",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`


// src/lib/prompt/postgenerate/post.prompt.ts

// src/lib/prompt/postgenerate/post.prompt.ts

export const buildUserTextPrompt = (userPrompt: string): string =>
  `You are a social media content expert.
User request: ${userPrompt}

Generate a short, engaging text in 2-3 lines based on the user request.
Respond ONLY with the text, no JSON, no markdown, no extra explanation.`