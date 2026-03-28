import { Controller, Get, Query, Headers,Param,NotFoundException, Res,Delete, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Response } from 'express'
import { ImagesService } from './images.service'

@Controller('display-images')
export class DisplayImagesController {
  constructor(private readonly imagesService: ImagesService) {}

 @Get()
  async getImagesBySubIndustry(@Query('subIndustryId') subIndustryId?: string) {
    try {
      const images = await this.imagesService.getImagesBySubIndustry(subIndustryId)
      return { images }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Failed to fetch images')
    }
  }

@Get('one-image')
async getOneTextImage(@Query('subIndustryId') subIndustryId: string) {
  if (!subIndustryId) throw new BadRequestException('subIndustryId is required')
  try {
    const image = await this.imagesService.getOneTextImageBySubIndustry(subIndustryId)
    return { image }
  } catch (error) {
    if (error instanceof BadRequestException || error instanceof NotFoundException) throw error
    throw new InternalServerErrorException('Failed to fetch image')
  }
}
}