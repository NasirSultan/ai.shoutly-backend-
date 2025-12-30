import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'

export enum UserRole {
  USER = 'USER',
  SUPERADMIN = 'SUPERADMIN',
  CONTENTADMIN = 'CONTENTADMIN',
  TECHNICIANADMIN = 'TECHNICIANADMIN',
  FINANCEADMIN = 'FINANCEADMIN'
}

export class RegisterDto {
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole
}
