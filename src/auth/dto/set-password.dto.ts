import { IsNotEmpty, MinLength } from 'class-validator'

export class SetPasswordDto {
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}
