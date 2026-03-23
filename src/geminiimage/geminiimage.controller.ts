import { Controller, Post, Body } from '@nestjs/common'
import { GeminiImageService } from './geminiimage.service'

@Controller('gemini-image')
export class GeminiImageController {
  constructor(private readonly geminiImageService: GeminiImageService) {}

  @Post('generate')
  async generate(
    @Body('industryId') industryId: string,
    @Body('subIndustryId') subIndustryId: string,
    @Body('prompt') prompt: string
  ) {
    const image = await this.geminiImageService.generateAndUploadImage(industryId, subIndustryId, prompt)
    return { image }
  }
}