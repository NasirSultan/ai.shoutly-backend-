import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import FormData from 'form-data'
import * as dotenv from 'dotenv'
import { Express } from 'express'

dotenv.config()

const prisma = new PrismaClient()
const imgbbKey = process.env.IMGBB_KEY

type ImgbbUploadResult = {
  imageUrl: string
  deleteUrl: string
}

@Injectable()
export class ImagesService {

  async uploadToImgbb(file: Express.Multer.File): Promise<ImgbbUploadResult> {
    const form = new FormData()
    form.append('image', file.buffer.toString('base64'))

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      form,
      { headers: form.getHeaders() }
    )

    return {
      imageUrl: res.data.data.url,
      deleteUrl: res.data.data.delete_url
    }
  }

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
      subIndustryId,
      text
    }))

    try {
      await prisma.image.createMany({ data })
      return {
        success: true,
        total: data.length
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
    return prisma.image.deleteMany({
      where: {
        subIndustryId,
        text
      }
    })
  }
}
