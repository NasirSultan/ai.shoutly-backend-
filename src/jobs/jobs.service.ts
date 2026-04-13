import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaClient } from '@prisma/client'
import { PostQueue } from './post.queue'

const prisma = new PrismaClient()
const BATCH_SIZE = 10

@Injectable()
export class JobsService {
  constructor(private readonly postQueue: PostQueue) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkDuePosts() {
    console.log('[Scheduler] Checking for due posts...')

    let totalEnqueued = 0

    while (true) {

      const duePosts = await prisma.calendarPost.findMany({
        where: {
          postTime: { lte: new Date() },
          status: 'SCHEDULED',
          user: {
            connectedSocials: { has: 'FACEBOOK' },
            facebookAccount: {
              pages: { some: {} },
            },
          },
        },
        select: { id: true },
        take: BATCH_SIZE,
      })

      if (!duePosts.length) break

      const postIds = duePosts.map((p) => p.id)


      await prisma.calendarPost.updateMany({
        where: { id: { in: postIds }, status: 'SCHEDULED' },
        data: { status: 'POSTING' },
      })


      await Promise.all(postIds.map((id) => this.postQueue.addPublishJob(id)))

      totalEnqueued += postIds.length
      console.log(`[Scheduler] Batch enqueued: ${postIds.length} | Total: ${totalEnqueued}`)
    }

    if (totalEnqueued > 0) {
      console.log(`[Scheduler] Done. Total enqueued: ${totalEnqueued}`)
    }
  }
}