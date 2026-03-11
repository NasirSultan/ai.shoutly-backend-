import { Injectable,InternalServerErrorException,NotFoundException,BadRequestException  } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import FormData from 'form-data'
import * as dotenv from 'dotenv'
import { Express } from 'express'
import { RedisService } from '../../common/redis/redis.service'
import { createHash } from 'crypto'
dotenv.config()

const prisma = new PrismaClient()
const imgbbKey = process.env.IMGBB_KEY

type ImgbbUploadResult = {
  imageUrl: string
  deleteUrl: string
}

@Injectable()
export class ImagesService {
  constructor(private redisService: RedisService) {}
  // for testing only
   async uploadToImgbb(file: Express.Multer.File): Promise<ImgbbUploadResult> {
  console.log('Uploading file:', file.originalname, 'size:', file.size)
  console.log('ImgBB key present:', !!imgbbKey)
  const base64 = file.buffer.toString('base64')
  console.log('Base64 length:', base64.length)

  const form = new FormData()
  form.append('image', base64)

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      form,
      { headers: form.getHeaders() }
    )
    console.log('ImgBB response:', res.data)
    return {
      imageUrl: res.data.data.url,
      deleteUrl: res.data.data.delete_url
    }
  } catch (error: any) {
    if (error.response) {
      console.error('Axios error status:', error.response.status)
      console.error('Axios error data:', error.response.data)
    } else {
      console.error('Axios error:', error.message)
    }
    throw error
  }
}



  // async uploadToImgbb(file: Express.Multer.File): Promise<ImgbbUploadResult> {
  //   const form = new FormData()
  //   form.append('image', file.buffer.toString('base64'))

  //   const res = await axios.post(
  //     `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
  //     form,
  //     { headers: form.getHeaders() }
  //   )

  //   return {
  //     imageUrl: res.data.data.url,
  //     deleteUrl: res.data.data.delete_url
  //   }
  // }

  async uploadMultipleToImgbb(
    files: Express.Multer.File[]
  ): Promise<ImgbbUploadResult[]> {
    const uploaded: ImgbbUploadResult[] = []

    for (const file of files) {
      const result = await this.uploadToImgbb(file)
      uploaded.push(result)
    }

    return uploaded
  }

  async deleteFromImgbb(deleteUrls: string[]) {
    for (const url of deleteUrls) {
      await axios.get(url)
    }
  }

async createMultipleSafe(
  files: Express.Multer.File[],
  subIndustryId: string,
  text: boolean
) {
  const uploaded = await this.uploadMultipleToImgbb(files)

  const data = uploaded.map(item => ({
    file: item.imageUrl,
    deleteUrl: item.deleteUrl,
    subIndustryId,
    text
  }))

  try {
    await prisma.image.createMany({ data })
    return {
      success: true,
      total: data.length,
      images: data
    }
  } catch {
    const deleteUrls = uploaded.map(item => item.deleteUrl)
    await this.deleteFromImgbb(deleteUrls)
    throw new Error('Database failed. Images rolled back.')
  }
}

  async findAll(subIndustryId: string) {
    return prisma.image.findMany({
      where: { subIndustryId }
    })
  }

  async findGroupedByText(subIndustryId: string) {
    const subIndustry = await prisma.subIndustry.findUnique({
      where: { id: subIndustryId },
      select: {
        id: true,
        name: true,
        industry: { select: { name: true } }
      }
    })

    if (!subIndustry) return null

    const [textTrue, textFalse] = await Promise.all([
      prisma.image.findMany({
        where: { subIndustryId, text: true },
        select: { id: true, file: true }
      }),
      prisma.image.findMany({
        where: { subIndustryId, text: false },
        select: { id: true, file: true }
      })
    ])

    return {
      subIndustryId: subIndustry.id,
      subIndustryName: subIndustry.name,
      industryName: subIndustry.industry.name,
      groups: [
        {
          text: true,
          total: textTrue.length,
          images: textTrue
        },
        {
          text: false,
          total: textFalse.length,
          images: textFalse
        }
      ]
    }
  }

async deleteBySubIndustryAndText(subIndustryId: string, text: boolean) {
  const images = await prisma.image.findMany({
    where: { subIndustryId, text },
    select: { id: true, deleteUrl: true }
  })

  if (images.length === 0) {
    return {
      success: false,
      message: `No images found for subIndustryId '${subIndustryId}' with text=${text}`
    }
  }

  const deleteUrls = images
    .map(img => img.deleteUrl)
    .filter(url => !!url)

  if (deleteUrls.length > 0) {
    await this.deleteFromImgbb(deleteUrls)
  }

  const deleted = await prisma.image.deleteMany({
    where: { subIndustryId, text }
  })

  return {
    success: true,
    message: `Deleted ${deleted.count} image(s) from database and ${deleteUrls.length} image(s) from ImgBB.`,
    deletedCount: deleted.count,
    deletedFromImgBB: deleteUrls.length
  }
}



 async getImagesBySubIndustry(subIndustryId?: string) {
    const redis = this.redisService.getClient()
    const cacheKey = subIndustryId ? `subIndustry:${subIndustryId}:images` : 'allImages'
    const cacheTTL = 3600

    let images: { id: string; file: string; subIndustryId: string }[] = []
    const cached = await redis.get(cacheKey)

    if (cached) {
      images = JSON.parse(cached)
    } else {
      if (subIndustryId) {
        const validSubIndustry = await prisma.subIndustry.findUnique({ where: { id: subIndustryId } })
        if (!validSubIndustry) throw new BadRequestException('Invalid subIndustryId')

        images = await prisma.$queryRaw`
          SELECT id, file, "subIndustryId"
          FROM "Image"
          WHERE "subIndustryId" = ${subIndustryId}
          ORDER BY RANDOM()
          LIMIT 15
        `
      } else {
        images = await prisma.$queryRaw`
          SELECT id, file, "subIndustryId"
          FROM "Image"
          ORDER BY RANDOM()
          LIMIT 15
        `
      }
      await redis.set(cacheKey, JSON.stringify(images), { EX: cacheTTL })
    }

    return images
  }



 async deleteImageById(imageId: string) {
    const image = await prisma.image.findUnique({ where: { id: imageId } })
    if (!image) throw new NotFoundException('Image not found')

    if (image.deleteUrl) {
      try {
        await axios.get(image.deleteUrl)
      } catch (error) {
        console.error('Failed to delete image from ImgBB:', error.message)
      }
    }

    try {
      await prisma.image.delete({ where: { id: imageId } })
      return { success: true, message: 'Image deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete image from database')
    }
  }

}
