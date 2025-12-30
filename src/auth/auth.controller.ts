import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { SetPasswordDto } from './dto/set-password.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

@Post('register')
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto.name, dto.email, dto.role)
}


  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp)
  }

  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto.email, dto.password)
  }

@Post('update-profile')
async updateProfile(@Body() dto: UpdateProfileDto) {
  return this.authService.updateProfile(dto.email, dto)
}

@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto.email, dto.password)
}

@Post('refresh-token')
async refresh(@Body() dto: RefreshTokenDto) {
  return this.authService.refreshToken(dto.refreshToken)
}

  @Post('send-otp')
  async sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email)
  }

  @Post('verify-otp-reset')
  async verifyOtpReset(@Body() body: { email: string, otp: string }) {
    return this.authService.verifyOtpForReset(body.email, body.otp)
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string, password: string }) {
    return this.authService.resetPassword(body.email, body.password)
  }
}
