import { Controller, Get, Query, Headers,Param, Res,Delete, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Response } from 'express'
import { ImagesService } from './images.service'

@Controller('display-images')
export class DisplayImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getIndustriesWithImages(
    @Query('industryId') industryId?: string,
    @Headers('if-none-match') ifNoneMatch?: string,
    @Res() res?: Response
  ) {
    try {
      const result = await this.imagesService.getIndustriesAndRandomImages(industryId)
      const etag = result.industriesETag

      if (ifNoneMatch && ifNoneMatch === etag) return res.status(304).send()

      res.setHeader('ETag', etag)
      return res.json({ industries: result.industries, images: result.images })
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Failed to fetch industries and images')
    }
  }


    @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    if (!id) throw new BadRequestException('ImageId is required')
    return this.imagesService.deleteImageById(id)
  }
}