import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './createUser.dto';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() user: CreateUserDTO): Promise<UserEntity> {
    return new UserEntity(await this.usersService.createUser(user));
  }
}
