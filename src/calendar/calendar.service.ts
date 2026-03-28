import { Injectable,InternalServerErrorException ,NotFoundException} from '@nestjs/common'
import { PrismaClient, CalendarPost, Subscription } from '@prisma/client'
import { generatePostsForMonth } from './generators/calendar.generator'

const prisma = new PrismaClient()

@Injectable()
export class CalendarService {
  async generatePlan(
    userId: string,
    prompt: string,
    subIndustryIds: string[],
    postTimeInput: string
  ) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
    })

    let trial: Subscription | null = null
    if (!subscription) {
      trial = await prisma.subscription.findFirst({
        where: { userId, isTrial: true },
      })

      if (trial) {
        return {
          success: false,
          message: 'Free trial already used. Please buy a plan.',
        }
      }

      if (!trial) {
        trial = await prisma.subscription.create({
          data: { userId, isTrial: true, isActive: false },
        })
      }
    }

    const planType = subscription ? 'PAID' : 'FREE'
    const totalDays = subscription ? 31 : 7

    const [hours, minutes] = postTimeInput.split(':').map(Number)
    const today = new Date()
    today.setHours(hours, minutes, 0, 0)

    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      return d
    })

    await prisma.calendarPost.deleteMany({
      where: { userId },
    })

    const generatedPosts = await generatePostsForMonth(
      prisma,
      userId,
      days,
      subIndustryIds
    )

    if (!generatedPosts.length) {
      return {
        success: false,
        message: 'No posts available',
      }
    }

    const operations = generatedPosts.map(post =>
      prisma.calendarPost.create({
        data: {
          userId,
          subIndustryId: post.subIndustryId,
          contentId: post.contentId,
          reelId: post.reelId,
          imageId: post.imageId,
          type: post.type,
          postTime: post.postTime,
          status: post.status,
        },
      })
    )

    let savedPosts: CalendarPost[]

    try {
      savedPosts = await prisma.$transaction(operations)

      return {
        success: true,
        message: 'Plan created successfully',
        planType,
        startPlan: today,
        totalPosts: savedPosts.length,
        posts: savedPosts,
      }
    } catch {
      return {
        success: false,
        message: 'Plan creation failed',
      }
    }
  }

async getPlanByUser(userId: string) {
  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        connectedSocials: true
      }
    }),
    prisma.calendarPost.findMany({
      where: { userId },
      orderBy: { postTime: 'asc' },
      include: {
        content: {
          include: {
            hashtags: {
              include: {
                hashtag: true
              }
            }
          }
        },
        reel: true,
        image: true
      }
    })
  ])

  if (!posts.length) {
    return {
      success: false,
      message: 'No plan found for this user'
    }
  }

  const formattedPosts = posts.map(post => ({
    postId: post.id,
    postTime: post.postTime,
    status: post.status,
    content: post.content ? {
      contentId: post.content.id,
      text: post.content.text,
      hashtags: post.content.hashtags.map(ch => `#${ch.hashtag.tag}`)
    } : null,
    media: post.imageUrl
      ? { type: 'IMAGE', id: post.imageId, file: post.imageUrl }
      : post.image
      ? { type: 'IMAGE', id: post.image.id, file: post.image.file }
      : post.reel
      ? { type: 'REEL', id: post.reel.id, file: post.reel.file }
      : null
  }))

  return {
    success: true,
    meta: {
      totalPosts: posts.length,
      connectedSocials: user?.connectedSocials || []
    },
    posts: formattedPosts
  }
}




async updatePost(
  userId: string,
  postId: string,
  body: { postTime?: string; status?: string; contentText?: string; reelId?: string; imageUrl?: string },
  fileData?: { imageUrl: string; deleteUrl: string }
) {
  const post = await prisma.calendarPost.findUnique({ where: { id: postId } })

  if (!post || post.userId !== userId) {
    return { success: false, message: 'Post not found or unauthorized' }
  }

  let updatedData: any = {}

  if (body.postTime) updatedData.postTime = new Date(body.postTime)
  if (body.status) updatedData.status = body.status
  if (body.reelId !== undefined) updatedData.reelId = body.reelId

  // Decide which image to use (imageUrl takes priority)
  let imageData: { imageUrl: string; deleteUrl: string } | undefined
  if (body.imageUrl) {
    imageData = { imageUrl: body.imageUrl, deleteUrl: '' }
  } else if (fileData) {
    imageData = fileData
  }

  const operations: Array<Promise<{ id: string }>> = []

  // Create content if contentText provided
  if (body.contentText) {
    operations.push(
      prisma.content.create({
        data: { text: body.contentText, subIndustryId: post.subIndustryId }
      })
    )
  }

  // Create image record if imageData exists
  if (imageData) {
    operations.push(
      prisma.image.create({
        data: {
          file: imageData.imageUrl,
          deleteUrl: imageData.deleteUrl,
          text: false,
          subIndustryId: post.subIndustryId
        }
      })
    )
  }

  // Execute all operations in parallel
  if (operations.length) {
    const results = await Promise.all(operations)

    if (body.contentText) {
      const newContent = results.find(r => 'text' in r)
      if (newContent) updatedData.contentId = newContent.id
    }

    if (imageData) {
      const newImage = results.find(r => 'file' in r)
      if (newImage) {
        updatedData.imageId = newImage.id
        updatedData.imageUrl = imageData.imageUrl
        updatedData.type = 'IMAGE'
      }
    }
  }

  try {
    const updatedPost = await prisma.calendarPost.update({
      where: { id: postId },
      data: updatedData
    })

    return {
      success: true,
      message: 'Post updated',
      post: updatedPost
    }
  } catch {
    throw new InternalServerErrorException('Failed to update post')
  }
}


async getPostDetails(userId: string, postId: string) {
  const post = await prisma.calendarPost.findUnique({
    where: { id: postId },
    include: {
      content: {
        include: {
          hashtags: {
            include: { hashtag: true }
          }
        }
      },
      reel: true,
      image: true
    }
  })

  if (!post || post.userId !== userId) {
    throw new NotFoundException('Post not found or unauthorized')
  }

const formattedPost = {
  postId: post.id,
  postTime: post.postTime,
  status: post.status,
  content: post.content
    ? {
        contentId: post.content.id,
        text: post.content.text,
        hashtags: post.content.hashtags.map(ch => `#${ch.hashtag.tag}`)
      }
    : null,
  media: post.imageUrl
    ? { type: 'IMAGE', id: post.imageId, file: post.imageUrl }
    : post.image
    ? { type: 'IMAGE', id: post.image.id, file: post.image.file }
    : post.reel
    ? { type: 'REEL', id: post.reel.id, file: post.reel.file }
    : null
}

  return { success: true, post: formattedPost }
}

async createPost(
  userId: string,
  body: { subIndustryId: string; postTime: string; contentText?: string; imageUrl?: string },
  imageData?: { imageUrl: string; deleteUrl: string }
) {
  const { subIndustryId, postTime, contentText } = body

  let contentId: string | undefined
  let imageId: string | undefined
  let imageUrl: string | undefined

  const operations: any[] = []

  if (contentText) {
    operations.push(
      prisma.content.create({
        data: {
          text: contentText,
          subIndustryId
        }
      })
    )
  }

  if (imageData) {
    operations.push(
      prisma.image.create({
        data: {
          file: imageData.imageUrl,
          deleteUrl: imageData.deleteUrl,
          text: false,
          subIndustryId
        }
      })
    )
  }

  const results = operations.length ? await Promise.all(operations) : []

  if (contentText) {
    contentId = results[0]?.id
  }

  if (imageData) {
    const index = contentText ? 1 : 0
    imageId = results[index]?.id
    imageUrl = imageData.imageUrl
  }

  const post = await prisma.calendarPost.create({
    data: {
      userId,
      subIndustryId,
      contentId,
      imageId,
      imageUrl,
      type: 'IMAGE',
      postTime: new Date(postTime),
      status: 'SCHEDULED'
    }
  })

  return {
    success: true,
    message: 'Post created',
    post
  }
}

}