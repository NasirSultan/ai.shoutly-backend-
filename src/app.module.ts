import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import  {CalendarModule } from './calendar/calendar.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MetaAccountsModule } from './social-media/meta/meta-accounts.module';
import { IndustriesModule } from './industries/industries.module'
import { ImagelayoutModule } from './imagelayout/imagelayout.module';
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { BrevoModule } from './brevo/brevo.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './users/user.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),ImagelayoutModule, MetaAccountsModule,IndustriesModule, AuthModule, 
    UserModule, BrevoModule,
      JwtModule.register({
      secret: process.env.JWT_SECRET, // must be defined in .env
      signOptions: { expiresIn: '8h' },
    }),
  SubscriptionModule,
  CalendarModule

],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
