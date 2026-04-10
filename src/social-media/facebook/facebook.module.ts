import { Module } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';
import { PrismaClient } from '@prisma/client'
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacebookController],
  providers: [FacebookService, PrismaClient],
  exports: [FacebookService],
})
export class FacebookModule {}