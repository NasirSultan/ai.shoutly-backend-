import { Module } from '@nestjs/common';
import { MetaAccountsService } from './meta-accounts.service';
import { MetaAccountsController } from './meta-accounts.controller';

@Module({
  providers: [MetaAccountsService],
  controllers: [MetaAccountsController],
})
export class MetaAccountsModule {}
