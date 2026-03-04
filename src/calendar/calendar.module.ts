import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { AuthModule } from "../auth/auth.module";
import { ImgbbService } from '../lib/imgbb/imgbb.service'
@Module({
  imports: [AuthModule],
  providers: [CalendarService,ImgbbService],
  controllers: [CalendarController],
})
export class CalendarModule {}