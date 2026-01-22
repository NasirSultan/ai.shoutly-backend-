import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { LogoSize, LogoPosition } from '@prisma/client';

export class CreateLogoDto {
  @IsEnum(LogoSize)
  size: LogoSize;

  @IsEnum(LogoPosition)
  position: LogoPosition;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
