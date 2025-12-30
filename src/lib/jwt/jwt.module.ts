import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { JwtLibService } from './jwt.service'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretkey',
      signOptions: { expiresIn: 900 }
    })
  ],
  providers: [JwtLibService],
  exports: [JwtLibService],
})
export class JwtLibModule {}
