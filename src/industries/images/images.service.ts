import { Injectable } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
import axios from 'axios'
import FormData from 'form-data'
import * as dotenv from 'dotenv'
import { Express } from 'express'

dotenv.config()

const prisma = new PrismaClient()
const IMGBB_KEY = process.env.IMGBB_KEY

@Injectable()
export class ImagesService {
  async uploadToImgbb(file: Express.Multer.File) {
    const form = new FormData()
    form.append('image', file.buffer.toString('base64'))
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, form, {
      headers: form.getHeaders()
    })
    return res.data.data.url
  }

  async uploadMultipleToImgbb(files: Express.Multer.File[]) {
    const urls: string[] = []
    for (const file of files) {
      const url = await this.uploadToImgbb(file)
      urls.push(url)
    }
    return urls
  }

  async createMultiple(urls: string[], subIndustryId: string, text: boolean) {
    const data: Prisma.ImageCreateManyInput[] = urls.map(url => ({
      file: url,
      subIndustryId,
      text
    }))
    return prisma.image.createMany({ data })
  }

  async findAll(subIndustryId: string) {
    return prisma.image.findMany({ where: { subIndustryId } })
  }


async findGroupedByText(subIndustryId: string) {
  const [trueImages, falseImages] = await Promise.all([
    prisma.image.findMany({
      where: { subIndustryId, text: true },
      select: { id: true, file: true }
    }),
    prisma.image.findMany({
      where: { subIndustryId, text: false },
      select: { id: true, file: true }
    })
  ])

  return [
    { text: true, total: trueImages.length, images: trueImages },
    { text: false, total: falseImages.length, images: falseImages }
  ]
}

async deleteBySubIndustryAndText(subIndustryId: string, text: boolean) {
  return prisma.image.deleteMany({
    where: {
      subIndustryId,
      text
    }
  })
}




}
