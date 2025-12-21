import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.user.findMany()
    } catch {
      throw new InternalServerErrorException('Unable to fetch users. Please try again later.')
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } })
      if (!user) {
        throw new NotFoundException('User not found.')
      }
      return user
    } catch (e) {
      if (e instanceof NotFoundException) throw e
      throw new InternalServerErrorException('Unable to fetch user. Please try again later.')
    }
  }

async create(data: CreateUserDto) {
  try {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('Email already exists.');
    }

    const user = await this.prisma.user.create({ data });

    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new InternalServerErrorException('MailerSend API key is missing');

    const mailerSend = new MailerSend({ apiKey });
    const sentFrom = new Sender('noreply@shoutlyai.com', 'Shoutly AI');

    const recipients = [new Recipient(user.email, user.name || 'User')];
    const personalization = [{ email: user.email, data: { Name: user.name || 'User' } }];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("You’re In! Your Early Access to Shoutly AI Is Confirmed")
      .setTemplateId('0r83ql3yqomgzw1j')
      .setPersonalization(personalization);

    mailerSend.email.send(emailParams).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    return user;
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
    throw new InternalServerErrorException('Unable to create user. Please try again later.');
  }
}


  async update(id: string, data: UpdateUserDto) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } })
      if (!existing) {
        throw new NotFoundException('User not found.')
      }
      if (data.email) {
        const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } })
        if (emailExists && emailExists.id !== id) {
          throw new BadRequestException('Email already exists.')
        }
      }
      await this.prisma.user.update({ where: { id }, data })
      return { message: 'User updated successfully.' }
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) throw e
      throw new InternalServerErrorException('Unable to update user. Please try again later.')
    }
  }

  async delete(id: string) {
    try {
      const existing = await this.prisma.user.findUnique({ where: { id } })
      if (!existing) {
        throw new NotFoundException('User not found.')
      }
      await this.prisma.user.delete({ where: { id } })
      return { message: 'User deleted successfully.' }
    } catch (e) {
      if (e instanceof NotFoundException) throw e
      throw new InternalServerErrorException('Unable to delete user. Please try again later.')
    }
  }
}
