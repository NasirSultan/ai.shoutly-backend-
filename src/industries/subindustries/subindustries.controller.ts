import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common'
import { SubindustriesService } from './subindustries.service'

@Controller('subindustries')
export class SubindustriesController {
  constructor(private service: SubindustriesService) {}

@Post('bulk')
createMany(
  @Body('industryId') industryId: string,
  @Body('names') names: string[]
) {
  return this.service.createSubindustries(industryId, names)
}


  @Get()
  findAll() {
    return this.service.getAllSubindustries()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getSubindustryById(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.service.updateSubindustry(id, name)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteSubindustry(id)
  }
}
