import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { MailingService } from '@/mailing/mailing.service';

import { CreateUserDTO } from './createUser.dto';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailingService: MailingService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() user: CreateUserDTO): Promise<UserEntity> {
    const createdUser = await this.usersService.createUser(user);

    if (createdUser) {
      const token = await this.usersService.createActivationToken(createdUser);
      await this.mailingService.sendUserActivationEmail(createdUser, token);
    }

    return new UserEntity(createdUser);
  }
}
