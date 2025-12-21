import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { MetaAccountsService } from './meta-accounts.service';

@Controller('social-media/meta')
export class MetaAccountsController {
  constructor(private readonly metaService: MetaAccountsService) {}

  @Get('list')
  async list(@Query('userId') userId: string) {
    return this.metaService.listAccounts(userId);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('userId') userId: string) {
    return this.metaService.linkAccount(userId, code);
  }

  @Post('refresh/:id')
  async refresh(@Param('id') accountId: string) {
    return this.metaService.refreshToken(accountId);
  }
}
