import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }



async generateText(prompt: string, retries = 3, delayMs = 2000): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })
      return result.text ?? ''
    } catch (error: any) {
      const message = this.extractErrorMessage(error)
      const isOverloaded =
        message.includes('high demand') ||
        message.includes('overloaded') ||
        message.includes('503') ||
        message.includes('429')

      if (isOverloaded && attempt < retries) {
        console.warn(`[GeminiService] Attempt ${attempt} failed, retrying in ${delayMs}ms...`)
        await new Promise((res) => setTimeout(res, delayMs * attempt))
        continue
      }

      console.error('[GeminiService] generateText failed:', message)
      throw new InternalServerErrorException(`Gemini Error: ${message}`)
    }
  }
  throw new InternalServerErrorException('Gemini Error: Max retries exceeded')
}

async generateImages(prompt: string): Promise<string[]> {
  try {
    const result = await this.ai.models.generateContent({
model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const images: string[] = [];

    for (const part of result.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        images.push(part.inlineData.data);
      }
    }

    return images;
  } catch (error: any) {
    const message = this.extractErrorMessage(error);
    console.error('[GeminiService] generateImages failed:', message);
    throw new InternalServerErrorException(`Image Error: ${message}`);
  }
}

  private extractErrorMessage(error: any): string {
    try {
      const body =
        typeof error?.errorDetails === 'string'
          ? JSON.parse(error.errorDetails)
          : error?.errorDetails ?? JSON.parse(error?.message ?? '{}');

      if (body?.error?.message) return body.error.message;
    } catch {}

    return error?.message ?? 'Unknown error';
  }
}