import { Injectable, OnModuleInit } from '@nestjs/common'
import { Worker, Job } from 'bullmq'
import { PrismaClient } from '@prisma/client'
import { RedisService } from '../common/redis/redis.service'
import { FacebookService } from '../social-media/facebook/facebook.service'
import { BrevoService } from 'src/brevo/brevo.service'
import { DateTime } from 'luxon'

const prisma = new PrismaClient()

interface PublishJobData {
  calendarPostId: string
}

@Injectable()
export class PostWorker implements OnModuleInit {
  private worker!: Worker<PublishJobData>

  constructor(
    private readonly redisService: RedisService,
    private readonly facebookService: FacebookService,
    private readonly brevoService: BrevoService,
  ) {}

  onModuleInit() {
    this.worker = new Worker<PublishJobData>(
      'facebook-post',
      async (job: Job<PublishJobData>) => this.process(job),
      {
        connection: this.redisService.createIORedisClient(),
        concurrency: 5,
      },
    )

    this.worker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed`)
    })

    this.worker.on('failed', async (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err.message)

      if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
        await prisma.calendarPost.update({
          where: { id: job.data.calendarPostId },
          data: { status: 'FAILED' },
        })
      }
    })
  }

  private async process(job: Job<PublishJobData>) {
    const { calendarPostId } = job.data

    const post = await prisma.calendarPost.findUnique({
      where: { id: calendarPostId },
      include: {
        user: {
          include: {
            facebookAccount: {
              include: { pages: true },
            },
          },
        },
        content: {
          include: {
            hashtags: { include: { hashtag: true } },
          },
        },
        image: true,
        reel: true,
      },
    })

    if (!post) throw new Error(`Post ${calendarPostId} not found`)
    if (post.status !== 'POSTING') throw new Error(`Post ${calendarPostId} already ${post.status}`)

    const { user } = post
    const fbAccount = user.facebookAccount
    if (!fbAccount) throw new Error(`User ${user.id} has no Facebook account`)

    const defaultPage = fbAccount.pages.find((p) => p.isDefault) || fbAccount.pages[0]
    if (!defaultPage) throw new Error(`User ${user.id} has no Facebook page`)

    const hashtags = post.content?.hashtags?.map((ch) => ch.hashtag.tag) || []
    const imageUrl = post.image?.file || post.imageUrl || undefined

    const result = await this.facebookService.postToPage({
      pageId: defaultPage.pageId,
      title: user.brandName || '',
      message: post.content?.text || '',
      imageUrl,
      hashtags,
    })

    await prisma.calendarPost.update({
      where: { id: calendarPostId },
      data: { status: 'POSTED' },
    })

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true, timezone: true },
    })

    if (userData?.email) {
      const tz = userData.timezone || 'Asia/Karachi'
      const postedAt = DateTime.now().setZone(tz).toFormat("MMM dd, yyyy 'at' hh:mm a")

      await this.brevoService.sendPostPublishedEmail(
        userData.email,
        userData.name,
        defaultPage.pageName || defaultPage.pageId,
        postedAt,
      ).catch((err) => console.error('[Brevo] Email failed:', err.message))
    }

    return result
  }
}