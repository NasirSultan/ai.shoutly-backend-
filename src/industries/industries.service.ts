import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class IndustriesService {
  private prisma = new PrismaClient()

  async createIndustry(name: string) {
    return this.prisma.industry.create({
      data: { name },
    })
  }

async getAllIndustries() {
  return this.prisma.industry.findMany({
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
              text: true
            }
          }
        }
      }
    }
  })
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
