import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LogoModule } from './logo/logo.module';

@Module({
  imports: [LogoModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
