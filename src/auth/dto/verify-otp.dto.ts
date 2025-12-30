import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class VerifyOtpDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  otp: string
}
