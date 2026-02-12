import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { IndustriesService } from './industries.service'

@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) { }

  @Post()
  create(@Body('name') name: string) {
    return this.industriesService.createIndustry(name)
  }

  @Get('clear-cache')
  clearCache() {
    return this.industriesService.clearIndustriesCache()
  }
  
  @Get()
  findAll() {
    return this.industriesService.getAllIndustries()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industriesService.getIndustryById(id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.industriesService.updateIndustry(id, name)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industriesService.deleteIndustry(id)
  }


}
