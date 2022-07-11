import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import messages from '@utils/constants/messages';

import { CreateUserDTO } from './createUser.dto';
import { UserEntity } from './user.entity';
import * as dayjs from 'dayjs';

const TABLE_NAME = 'users';
const TOKENS_TABLE_NAME = 'user_activation_tokens';

@Injectable()
export class UsersService {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async createUser(user: CreateUserDTO): Promise<UserEntity> {
    const { username, displayName, email, password } = user;
    const createdUser = new UserEntity({
      username,
      displayName,
      email,
    });

    const [existing] = await this.knex(TABLE_NAME)
      .select<[UserEntity]>(['username', 'email'])
      .where({ username })
      .orWhere({ email });

    if (existing) {
      if (existing.email === email) {
        throw new HttpException(messages.EMAIL_TAKEN, HttpStatus.BAD_REQUEST);
      }

      if (existing.username === username) {
        throw new HttpException(
          messages.USERNAME_TAKEN,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    const [insertedUser] = await this.knex(TABLE_NAME)
      .insert({
        ...createdUser,
        password: hashedPassword,
      })
      .returning<[UserEntity]>(['id', 'username', 'email', 'password']);
    return insertedUser;
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.knex(TABLE_NAME)
      .select('id, email, password')
      .where({
        email,
      })
      .first<UserEntity>();

    if (!user) {
      throw new HttpException(messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException(messages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async createActivationToken(user: UserEntity): Promise<string> {
    const token = randomBytes(12).toString('hex');

    const [savedToken] = await this.knex
      .table(TOKENS_TABLE_NAME)
      .insert({
        userId: user.id,
        token,
        validUntil: dayjs().add(24, 'hour').toDate(),
      })
      .returning<[string]>(['token']);

    return savedToken;
  }
}
