import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MetaAccountsModule } from './social-media/meta/meta-accounts.module';
import { IndustriesModule } from './industries/industries.module'
import { ImagelayoutModule } from './imagelayout/imagelayout.module';
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),ImagelayoutModule, MetaAccountsModule,IndustriesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
