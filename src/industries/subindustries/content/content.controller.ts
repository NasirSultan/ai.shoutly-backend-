import { Controller,Delete, Post, Body,Query, Param, Get } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('subindustries/:id/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

@Post('bulk')
async createBulk(
  @Param('id') subIndustryId: string,
  @Body() posts: CreateContentDto[],
) {
  return this.contentService.createMultipleContents(subIndustryId, posts);
}

  @Get()
  async findAll(@Param('id') subIndustryId: string) {
    return this.contentService.getContentsBySubIndustry(subIndustryId);
  }

  @Delete()
  async deleteAll(@Param('id') subIndustryId: string) {
    return this.contentService.deleteContentsBySubIndustry(subIndustryId);
  }



}
