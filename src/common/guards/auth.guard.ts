import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtLibService } from '../../lib/jwt/jwt.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtLibService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    if (!authHeader) throw new UnauthorizedException('No token provided')

    const token = authHeader.split(' ')[1]
    try {
      const payload = await this.jwtService.verify(token)
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
