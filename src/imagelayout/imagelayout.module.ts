import { Module } from '@nestjs/common';
import { ImagelayoutService } from './imagelayout.service';
import { ImagelayoutController } from './imagelayout.controller';

@Module({
  controllers: [ImagelayoutController],
  providers: [ImagelayoutService],
})
export class ImagelayoutModule {}