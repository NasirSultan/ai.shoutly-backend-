import { Module } from '@nestjs/common';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';
import { JwtLibModule } from '../../lib/jwt/jwt.module' 


@Module({
    imports: [JwtLibModule],
  controllers: [LogoController],
  providers: [LogoService],
})
export class LogoModule {}
