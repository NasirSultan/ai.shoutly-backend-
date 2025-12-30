import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'

@Injectable()
export class JwtLibService {
  constructor(private jwt: NestJwtService) {}

  sign(payload: any, options?: { expiresIn?: number }) {
    return this.jwt.sign(payload, options)
  }

  verify(token: string) {
    return this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'secretkey' })
  }
}
