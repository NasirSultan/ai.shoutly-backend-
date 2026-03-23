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

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return result.text ?? '';
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      console.error('[GeminiService] generateText failed:', message);
      throw new InternalServerErrorException(`Gemini Error: ${message}`);
    }
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