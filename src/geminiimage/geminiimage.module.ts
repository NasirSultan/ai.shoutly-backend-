import { Module } from '@nestjs/common'
import { PostGeneratorService } from './geminiimage.service'

import { PostGeneratorController } from './geminiimage.controller'
import { GeminiService } from '../lib/llm/geminillm/gemini.service'
import { ImgbbService } from '../lib/imgbb/imgbb.service'

@Module({
  providers: [PostGeneratorService, GeminiService, ImgbbService],
  controllers: [PostGeneratorController],
  exports: [PostGeneratorService],
})
export class GeminiImageModule {}