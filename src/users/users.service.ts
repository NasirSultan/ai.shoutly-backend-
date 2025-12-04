import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.user.findMany()
    } catch (e) {
      throw new InternalServerErrorException('Server error')
    }
  }

  async create(data: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data })
    } catch (e) {
      throw new InternalServerErrorException('Server error')
    }
  }

  async update(id: string, data: UpdateUserDto) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } })
      if (!existing) {
        throw new NotFoundException('User not found')
      }
      return await this.prisma.user.update({ where: { id }, data })
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e
      }
      throw new InternalServerErrorException('Server error')
    }
  }

  async delete(id: string) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } })
      if (!existing) {
        throw new NotFoundException('User not found')
      }
      return await this.prisma.user.delete({ where: { id } })
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e
      }
      throw new InternalServerErrorException('Server error')
    }
  }
}
