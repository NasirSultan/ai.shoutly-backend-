import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { RedisService } from '../common/redis/redis.service'
@Injectable()
export class IndustriesService {
  private prisma = new PrismaClient()
   constructor(private redisService: RedisService) {}

  async createIndustry(name: string) {
    return this.prisma.industry.create({
      data: { name },
    })
  }

async getAllIndustries() {
  const client = this.redisService.getClient()
  const cacheKey = 'all_industries'

  const cachedData = await client.get(cacheKey)
  if (cachedData) {
    console.log('Data fetched from Redis')
    return JSON.parse(cachedData)
  }

  const industries = await this.prisma.industry.findMany({
    select: {
      id: true,
      name: true,
      subIndustries: {
        select: {
          id: true,
          name: true,
          images: {
            select: {
              id: true,
              file: true,
              text: true,
            },
          },
        },
      },
    },
  })

  console.log('Data fetched from Database')
  await client.set(cacheKey, JSON.stringify(industries))

  return industries
}





  async getIndustryById(id: string) {
    return this.prisma.industry.findUnique({
      where: { id },
      include: { subIndustries: { include: { images: true } } },
    })
  }

  async updateIndustry(id: string, name: string) {
    return this.prisma.industry.update({
      where: { id },
      data: { name },
    })
  }

  async deleteIndustry(id: string) {
    return this.prisma.industry.delete({ where: { id } })
  }
}
