import { Controller, Post, Body } from '@nestjs/common';
import { ImagelayoutService } from './imagelayout.service';
import { LayoutDto } from './layout.dto';

@Controller('imagelayout')
export class ImagelayoutController {
  constructor(private readonly service: ImagelayoutService) {}

  @Post('create')
  async create(@Body() dto: LayoutDto) {
    return this.service.createLayout(dto);
  }
}
