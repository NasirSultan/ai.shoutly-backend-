import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaModule } from '../lib/prisma.module'
import { JwtLibModule } from '../lib/jwt/jwt.module'
import { RedisModule } from '../common/redis/redis.module'


@Module({
  imports: [PrismaModule,
    JwtLibModule,
    RedisModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
