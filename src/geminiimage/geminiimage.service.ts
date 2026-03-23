// geminiimage.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../lib/llm/geminillm/gemini.service'
import { ImgbbService } from '../lib/imgbb/imgbb.service'
import { buildPostImagePrompt, buildPostTextPrompt } from '../lib/prompt/post.prompt'
import { Express } from 'express'

const prisma = new PrismaClient()

export interface GeneratedPost {
  image: { imageUrl: string; deleteUrl?: string }
  text: string
  hashtags: string[]
  source: 'LLM' | 'DB'
  index: number
}

export interface StreamEvent {
  index: number
  post: GeneratedPost
  saved?: any
}

type OnPost = (event: StreamEvent) => void

const DB_DELAY_MS = 10000

@Injectable()
export class PostGeneratorService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly imgbbService: ImgbbService
  ) {}

  async generateMixedPostsStreamed(
    industryId: string,
    subIndustryId: string,
    userPrompt: string,
    onPost: OnPost
  ): Promise<void> {
    const { industry, subIndustry, dbImages, textResults } =
      await this.resolveBaseData(industryId, subIndustryId, userPrompt)

    // Start LLM generations immediately at t=0
    const llmStartTime = Date.now()
    const llm1Promise = this.generateAndUploadLLMImage(industry.name, subIndustry.name, userPrompt, 1)
    const llm2Promise = this.generateAndUploadLLMImage(industry.name, subIndustry.name, userPrompt, 2)

    const streamOrder: Array<{ type: 'DB'; dbIndex: number } | { type: 'LLM'; llmSlot: 1 | 2 }> = [
      { type: 'DB',  dbIndex: 0 },
      { type: 'DB',  dbIndex: 1 },
      { type: 'LLM', llmSlot: 1 },
      { type: 'DB',  dbIndex: 2 },
      { type: 'DB',  dbIndex: 3 },
      { type: 'DB',  dbIndex: 4 },
      { type: 'LLM', llmSlot: 2 },
    ]

    let globalIndex = 0

    for (const item of streamOrder) {
      if (item.type === 'DB') {
        await this.delay(DB_DELAY_MS)
        const { text, hashtags } = textResults[globalIndex]
        onPost({
          index: globalIndex,
          post: {
            image: { imageUrl: dbImages[item.dbIndex].file },
            text,
            hashtags,
            source: 'DB',
            index: globalIndex,
          },
        })
      } else {
        const llmPromise = item.llmSlot === 1 ? llm1Promise : llm2Promise
        const elapsed = Date.now() - llmStartTime
        const { text, hashtags } = textResults[globalIndex]

        // Wait for LLM only if not ready yet, otherwise render immediately
        const llmImage = await llmPromise
        const waitedMs = Date.now() - llmStartTime - elapsed
        if (waitedMs > 0) {
          console.log(`[LLM slot ${item.llmSlot}] waited extra ${waitedMs}ms`)
        }

        onPost({
          index: globalIndex,
          post: {
            image: llmImage,
            text,
            hashtags,
            source: 'LLM',
            index: globalIndex,
          },
        })
      }

      globalIndex++
    }
  }

  async generateMixedAndSavePostsStreamed(
    userId: string,
    industryId: string,
    subIndustryId: string,
    userPrompt: string,
    postTime: Date,
    onPost: OnPost
  ): Promise<void> {
    const { industry, subIndustry, dbImages, textResults } =
      await this.resolveBaseData(industryId, subIndustryId, userPrompt)

    // Start LLM generations immediately at t=0
    const llm1Promise = this.generateAndUploadLLMImage(industry.name, subIndustry.name, userPrompt, 1)
    const llm2Promise = this.generateAndUploadLLMImage(industry.name, subIndustry.name, userPrompt, 2)

    const streamOrder: Array<{ type: 'DB'; dbIndex: number } | { type: 'LLM'; llmSlot: 1 | 2 }> = [
      { type: 'DB',  dbIndex: 0 },
      { type: 'DB',  dbIndex: 1 },
      { type: 'LLM', llmSlot: 1 },
      { type: 'DB',  dbIndex: 2 },
      { type: 'DB',  dbIndex: 3 },
      { type: 'DB',  dbIndex: 4 },
      { type: 'LLM', llmSlot: 2 },
    ]

    let globalIndex = 0

    for (const item of streamOrder) {
      if (item.type === 'DB') {
        await this.delay(DB_DELAY_MS)
      }

      const { text, hashtags } = textResults[globalIndex]

      const savedHashtags = await Promise.all(
        hashtags.map((tag) =>
          prisma.hashtag.upsert({ where: { tag }, update: {}, create: { tag } })
        )
      )

      const savedContent = await prisma.content.create({
        data: {
          text,
          subIndustryId,
          hashtags: { create: savedHashtags.map((h) => ({ hashtagId: h.id })) },
        },
      })

      if (item.type === 'DB') {
        const dbImage = dbImages[item.dbIndex]
        const calendarPost = await prisma.calendarPost.create({
          data: {
            userId,
            subIndustryId,
            contentId: savedContent.id,
            imageId: dbImage.id,
            type: 'IMAGE',
            postTime,
            status: 'SCHEDULED',
          },
        })
        onPost({
          index: globalIndex,
          post: { image: { imageUrl: dbImage.file }, text, hashtags, source: 'DB', index: globalIndex },
          saved: { image: dbImage, calendarPost, content: savedContent },
        })
      } else {
        const uploaded = await (item.llmSlot === 1 ? llm1Promise : llm2Promise)
        const savedImage = await prisma.image.create({
          data: { file: uploaded.imageUrl, deleteUrl: uploaded.deleteUrl, subIndustryId, text: false },
        })
        const calendarPost = await prisma.calendarPost.create({
          data: {
            userId,
            subIndustryId,
            contentId: savedContent.id,
            imageId: savedImage.id,
            type: 'IMAGE',
            postTime,
            status: 'SCHEDULED',
          },
        })
        onPost({
          index: globalIndex,
          post: { image: uploaded, text, hashtags, source: 'LLM', index: globalIndex },
          saved: { image: savedImage, calendarPost, content: savedContent },
        })
      }

      globalIndex++
    }
  }

  // ── Shared resolver ────────────────────────────────────────────────────────

  private async resolveBaseData(industryId: string, subIndustryId: string, userPrompt: string) {
    const [industry, subIndustry] = await Promise.all([
      prisma.industry.findUnique({ where: { id: industryId } }),
      prisma.subIndustry.findUnique({ where: { id: subIndustryId } }),
    ])

    if (!industry || !subIndustry) {
      throw new InternalServerErrorException('Invalid industry or sub-industry ID')
    }

    const [dbImages, ...textRaws] = await Promise.all([
      prisma.image.findMany({
        where: { subIndustryId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      ...Array.from({ length: 7 }, (_, i) =>
        this.geminiService.generateText(
          buildPostTextPrompt(industry.name, subIndustry.name, `${userPrompt} (variation ${i + 1})`)
        )
      ),
    ])

    if ((dbImages as any[]).length < 5) {
      throw new InternalServerErrorException(
        `Not enough DB images. Found ${(dbImages as any[]).length}, need 5.`
      )
    }

    const textResults = (textRaws as string[]).map((raw) => this.parseTextResult(raw))

    return { industry, subIndustry, dbImages: dbImages as any[], textResults }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async generateAndUploadLLMImage(
    industryName: string,
    subIndustryName: string,
    userPrompt: string,
    variation: number
  ): Promise<{ imageUrl: string; deleteUrl: string }> {
    const base64Images = await this.geminiService.generateImages(
      buildPostImagePrompt(industryName, subIndustryName, userPrompt, variation)
    )
    return this.uploadBase64Image(base64Images, `post_image_${variation}.png`)
  }

  private async uploadBase64Image(
    base64Images: string[],
    filename: string
  ): Promise<{ imageUrl: string; deleteUrl: string }> {
    if (!base64Images.length) {
      throw new InternalServerErrorException(`No image generated for ${filename}`)
    }
    const buffer = Buffer.from(base64Images[0], 'base64')
    const fakeFile: Express.Multer.File = {
      buffer,
      originalname: filename,
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File
    return this.imgbbService.uploadFile(fakeFile)
  }

  private parseTextResult(raw: string): { text: string; hashtags: string[] } {
    try {
      const clean = raw.replace(/```json|```/gi, '').trim()
      const parsed = JSON.parse(clean)
      return {
        text: parsed.text ?? '',
        hashtags: Array.isArray(parsed.hashtags)
          ? parsed.hashtags.map((h: string) => h.replace(/^#/, '').trim())
          : [],
      }
    } catch {
      return { text: raw.trim(), hashtags: [] }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
