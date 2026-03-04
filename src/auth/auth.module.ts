import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaModule } from '../lib/prisma.module'
import { JwtLibModule } from '../lib/jwt/jwt.module'
import { RedisModule } from '../common/redis/redis.module'
import { BrevoModule } from 'src/brevo/brevo.module'
import { ImgbbService } from '../lib/imgbb/imgbb.service'
@Module({
  imports: [PrismaModule,
    JwtLibModule,
    RedisModule,
    BrevoModule
  ],
  providers: [AuthService, ImgbbService],
  controllers: [AuthController],
    exports: [JwtLibModule] 
})
export class AuthModule {}
