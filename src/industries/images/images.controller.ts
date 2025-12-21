import { Controller, Post, UploadedFiles,Delete, UseInterceptors, Param, Get, Query } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ImagesService } from './images.service'
import { Express } from 'express'

@Controller('subindustries/:subIndustryId/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('multiple')
@UseInterceptors(FilesInterceptor('files', 31)) // max 10 files

  async uploadMultiple(
    @Param('subIndustryId') subIndustryId: string,
    @Query('text') text: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) return { message: 'No files uploaded' }
    const isText = text === 'true'
    const urls = await this.imagesService.uploadMultipleToImgbb(files)
    return this.imagesService.createMultiple(urls, subIndustryId, isText)
  }

  @Get()
  async findAll(@Param('subIndustryId') subIndustryId: string) {
    return this.imagesService.findAll(subIndustryId)
  }

@Get('grouped')
async getGroupedImages(@Param('subIndustryId') subIndustryId: string) {
  return this.imagesService.findGroupedByText(subIndustryId)
}


@Delete()
async deleteImages(
  @Param('subIndustryId') subIndustryId: string,
  @Query('text') text: string
) {
  return this.imagesService.deleteBySubIndustryAndText(
    subIndustryId,
    text === 'true'
  )
}


}
