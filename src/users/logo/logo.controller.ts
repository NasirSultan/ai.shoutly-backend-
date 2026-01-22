import { Controller, Post, Body, Req, UseGuards, UploadedFile, UseInterceptors, Patch, Get, Delete, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { LogoService } from './logo.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
import type { Express } from 'express';

@Controller('logo')
@UseGuards(AuthGuard)
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() dto: CreateLogoDto, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!req.user?.id) throw new UnauthorizedException('User not found in request');
    return this.logoService.create(req.user.id, dto, file);
  }

  @Get()
  findOne(@Req() req: any) {
    if (!req.user?.id) throw new UnauthorizedException('User not found in request');
    return this.logoService.findOne(req.user.id);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  update(@Body() dto: UpdateLogoDto, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!req.user?.id) throw new UnauthorizedException('User not found in request');
    return this.logoService.update(req.user.id, dto, file);
  }

  @Delete()
  remove(@Req() req: any) {
    if (!req.user?.id) throw new UnauthorizedException('User not found in request');
    return this.logoService.remove(req.user.id);
  }
}
