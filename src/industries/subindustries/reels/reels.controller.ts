import { Controller, Post, Param, UseInterceptors, UploadedFiles, Get, Delete } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ReelsService } from './reels.service'
import { Express } from 'express'

@Controller('subindustries/:subIndustryId/reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadReels(
    @Param('subIndustryId') subIndustryId: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      return { success: false, message: 'No files provided' }
    }

    const results = await this.reelsService.uploadMultipleReels(subIndustryId, files)

    return {
      success: true,
      message: 'File upload process completed',
      data: results
    }
  }

  @Get()
  async getReels(@Param('subIndustryId') subIndustryId: string) {
    return this.reelsService.findAllBySubIndustry(subIndustryId)
  }

  @Delete(':reelId')
  async deleteReel(@Param('reelId') reelId: string) {
    await this.reelsService.deleteReelById(reelId)
    return { success: true, message: 'Reel deleted successfully' }
  }
}