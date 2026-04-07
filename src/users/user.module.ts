import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LogoModule } from './logo/logo.module';
import { ImgbbService } from '../lib/imgbb/imgbb.service';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [LogoModule,AuthModule],
  controllers: [UserController],
  providers: [UserService,ImgbbService],
})
export class UserModule {}
