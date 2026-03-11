import { Controller, Get, Query, Headers,Param, Res,Delete, BadRequestException, InternalServerErrorException } from '@nestjs/common'
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


    @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    if (!id) throw new BadRequestException('ImageId is required')
    return this.imagesService.deleteImageById(id)
  }
}