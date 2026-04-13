import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { RedisModule } from '../common/redis/redis.module'
import { FacebookModule } from '../social-media/facebook/facebook.module'
import { JobsService } from './jobs.service'
import { PostQueue } from './post.queue'
import { PostWorker } from './post.worker'
import { BrevoModule } from '../brevo/brevo.module'
@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    FacebookModule,
    BrevoModule,
  ],
  providers: [JobsService, PostQueue, PostWorker],
})
export class JobsModule {}