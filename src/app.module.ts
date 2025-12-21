import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MetaAccountsModule } from './social-media/meta/meta-accounts.module';
import { IndustriesModule } from './industries/industries.module'
import { ImagelayoutModule } from './imagelayout/imagelayout.module';
@Module({
  imports: [UsersModule,ImagelayoutModule, MetaAccountsModule,IndustriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
