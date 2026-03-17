import { Module } from '@nestjs/common'
import { GoogleService } from './google.service'
import { GoogleController } from './google.controller'
import { PrismaModule } from '../../lib/prisma.module'
import { JwtLibModule } from '../../lib/jwt/jwt.module'

@Module({
  imports: [PrismaModule, JwtLibModule],
  providers: [GoogleService],
  controllers: [GoogleController],
  exports: [GoogleService],
})
export class GoogleModule {}