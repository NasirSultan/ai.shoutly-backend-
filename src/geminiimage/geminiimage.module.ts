import { Module } from '@nestjs/common'
import { GeminiImageService } from './geminiimage.service'
import { GeminiImageController } from './geminiimage.controller'
import { GeminiService } from '../lib/llm/geminillm/gemini.service'
import { ImgbbService } from '../lib/imgbb/imgbb.service'

@Module({
  providers: [GeminiImageService, GeminiService, ImgbbService],
  controllers: [GeminiImageController],
  exports: [GeminiImageService],
})
export class GeminiImageModule {}