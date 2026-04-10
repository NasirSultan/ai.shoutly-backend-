import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaClient } from '@prisma/client'
import { PostQueue } from './post.queue'

const prisma = new PrismaClient()

@Injectable()
export class JobsService {
  constructor(private readonly postQueue: PostQueue) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkDuePosts() {
    console.log('[Scheduler] Checking for due posts...')

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
    })

    if (!duePosts.length) return

    const postIds = duePosts.map((p) => p.id)

    await prisma.calendarPost.updateMany({
      where: { id: { in: postIds }, status: 'SCHEDULED' },
      data: { status: 'POSTING' },
    })

    await Promise.all(postIds.map((id) => this.postQueue.addPublishJob(id)))

    console.log(`[Scheduler] Enqueued ${postIds.length} jobs`)
  }
}