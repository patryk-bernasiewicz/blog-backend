import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { UsersModule } from '@/users/users.module';
import { INestApplication } from '@nestjs/common';
import { CreateUserDTO } from '@/users/createUser.dto';
import { UsersService } from '@/users/users.service';
import { UserEntity } from '@/users/user.entity';

describe('Create User', () => {
  let app: INestApplication;
  const usersService = {
    createUser: ({ username, displayName, email }: CreateUserDTO): UserEntity =>
      new UserEntity({
        username,
        displayName,
        email,
      }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST users', () => {
    const requestBody: CreateUserDTO = {
      username: 'lorem ipsum',
      displayName: 'Lorem Ipsum',
      email: 'valid@email.com',
      password: 'validPassword#123',
      confirmPassword: 'validPassword#123',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(requestBody)
      .then(({ statusCode, body }) => {
        expect(statusCode).toBe(201);
        expect(body).toHaveProperty('username');
        expect(body.username).toBe(requestBody.username);
        expect(body).toHaveProperty('displayName');
        expect(body.displayName).toBe(requestBody.displayName);
        expect(body).toHaveProperty('email');
        expect(body.email).toBe(requestBody.email);
      });
  });
});
