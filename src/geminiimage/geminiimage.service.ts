import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../lib/llm/geminillm/gemini.service'
import { ImgbbService } from '../lib/imgbb/imgbb.service'
import { Express } from 'express'

const prisma = new PrismaClient()

@Injectable()
export class GeminiImageService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly imgbbService: ImgbbService
  ) {}

  async generateAndUploadImage(
    industryId: string,
    subIndustryId: string,
    prompt: string
  ): Promise<{ imageUrl: string; deleteUrl: string }> {
    const industry = await prisma.industry.findUnique({ where: { id: industryId } })
    const subIndustry = await prisma.subIndustry.findUnique({ where: { id: subIndustryId } })

    if (!industry || !subIndustry) {
      throw new InternalServerErrorException('Invalid industry or sub-industry ID')
    }

    const fullPrompt = `Industry: ${industry.name} (${industryId}), SubIndustry: ${subIndustry.name} (${subIndustryId}), Prompt: ${prompt}`

    const base64Images = await this.geminiService.generateImages(fullPrompt)

    if (!base64Images.length) {
      throw new InternalServerErrorException('No image was generated')
    }

    const buffer = Buffer.from(base64Images[0], 'base64')
    const fakeFile = {
      buffer,
      originalname: 'generated.png',
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File

    return this.imgbbService.uploadFile(fakeFile)
  }
}