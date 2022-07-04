import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CreateUserDTO } from './createUser.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import messages from 'src/utils/constants/messages';

const TABLE_NAME = 'users';

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
    const hashedPassword = await bcrypt.hash(password, 5);

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

    const [insertedUser] = await this.knex
      .table(TABLE_NAME)
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
}
