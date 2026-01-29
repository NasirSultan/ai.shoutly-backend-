import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { IndustriesService } from './industries.service'
import { IndustriesController } from './industries.controller'
import { SubindustriesController } from './subindustries/subindustries.controller'
import { SubindustriesService } from './subindustries/subindustries.service'
import { ImagesController } from './images/images.controller'
import { ImagesService } from './images/images.service'
import { RedisModule } from '../common/redis/redis.module'
@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 }, // optional limit 5MB
    }),RedisModule
  ],
  controllers: [IndustriesController, SubindustriesController, ImagesController],
  providers: [IndustriesService, SubindustriesService, ImagesService],
})
export class IndustriesModule {}
