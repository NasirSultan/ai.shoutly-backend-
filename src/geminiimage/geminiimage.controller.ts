// geminiimage.controller.ts

import { Controller, Post, Body, Res } from '@nestjs/common'
import { Response } from 'express'
import { PostGeneratorService, StreamEvent } from './geminiimage.service'

@Controller('post-generator')
export class PostGeneratorController {
  constructor(private readonly postGeneratorService: PostGeneratorService) {}

  @Post('generate')
  async generate(
    @Body('industryId') industryId: string,
    @Body('subIndustryId') subIndustryId: string,
    @Body('prompt') prompt: string,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    await this.postGeneratorService.generateMixedPostsStreamed(
      industryId,
      subIndustryId,
      prompt,
      (event: StreamEvent) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    )

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  }

  @Post('generate-and-save')
  async generateAndSave(
    @Body('userId') userId: string,
    @Body('industryId') industryId: string,
    @Body('subIndustryId') subIndustryId: string,
    @Body('prompt') prompt: string,
    @Body('postTime') postTime: string,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    await this.postGeneratorService.generateMixedAndSavePostsStreamed(
      userId,
      industryId,
      subIndustryId,
      prompt,
      new Date(postTime),
      (event: StreamEvent) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    )

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  }
}