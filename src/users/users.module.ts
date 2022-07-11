import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailingModule } from '@/mailing/mailing.module';
import { MailingService } from '@/mailing/mailing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, MailingModule],
  providers: [UsersService, MailingService],
  controllers: [UsersController],
})
export class UsersModule {}
