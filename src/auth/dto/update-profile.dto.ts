import { IsOptional, IsString, IsArray, IsUrl, IsEmail, IsEnum } from 'class-validator'
import { SocialPlatform } from '@prisma/client'

export class UpdateProfileDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  brandName?: string

  @IsOptional()
  @IsString()
  brandLogo?: string

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsArray()
  @IsEnum(SocialPlatform, { each: true })
  connectedSocials?: SocialPlatform[]
}
