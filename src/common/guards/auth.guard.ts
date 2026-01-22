import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    if (!authHeader) throw new UnauthorizedException('No token provided')

    const token = authHeader.split(' ')[1]
    if (!token) throw new UnauthorizedException('Token malformed')

    try {
      const payload = this.jwtService.verify(token)
      // dynamically add user to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      }
      return true
    } catch (err) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
