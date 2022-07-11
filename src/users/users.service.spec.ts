import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import messages from '@utils/constants/messages';

import knex from 'knex';
import { getTracker, MockClient, Tracker } from 'knex-mock-client';
import { UserEntity } from './user.entity';

const db = knex({ client: MockClient });

jest.mock('bcrypt', () => ({
  hash: (password) => password,
  compare: (password, otherPassword) => password === otherPassword,
}));

describe('UsersService', () => {
  let tracker: Tracker;
  const user = {
    username: 'lorem ipsum',
    displayName: 'Lorem Ipsum',
    email: 'admin@admin.com',
    password: 'password!123',
    confirmPassword: 'password!123',
  };
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'default_KnexModuleConnectionToken',
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    tracker = getTracker();
  });

  afterEach(() => {
    if (tracker) {
      tracker.reset();
    }
  });

  describe('createUser()', () => {
    it('checks if email exists in the database', async () => {
      tracker.on.insert('users').response([user]);
      tracker.on.select('select "username", "email" from "users"').response([]);
      tracker.on.select('users').response([user]);

      const createdUser = await service.createUser(user);

      expect(tracker.history.insert).toHaveLength(1);
      expect(createdUser).toMatchObject(user);
    });

    it('checks if username exists in the database', async () => {
      tracker.on.insert('users').response([user]);
      tracker.on.select('users').response([
        {
          username: user.username,
          email: 'different@email.com',
        },
      ]);
      tracker.on.select('users').response([]);

      await expect(service.createUser(user)).rejects.toThrow(
        messages.USERNAME_TAKEN,
      );
    });

    it('checks if email exists in the database', async () => {
      tracker.on.insert('users').response([user]);
      tracker.on.select('users').response([
        {
          username: 'different_username',
          email: user.email,
        },
      ]);
      tracker.on.select('users').response([]);

      await expect(service.createUser(user)).rejects.toThrow(
        messages.EMAIL_TAKEN,
      );
    });

    it('correctly inserts user', async () => {
      tracker.on.insert('users').response([user]);
      tracker.on.select('select "username", "email" from "users"').response([]);
      tracker.on.select('users').response([user]);

      const createdUser = await service.createUser(user);

      expect(createdUser).toMatchObject(user);
    });
  });

  describe('validateUser()', () => {
    it('throws when user does not exist', async () => {
      tracker.on.select('users').response(null);

      await expect(
        service.validateUser(user.email, user.password),
      ).rejects.toThrow(messages.UNAUTHORIZED);
    });

    it('throws when passwords do not match', async () => {
      tracker.on.select('users').response({
        id: 1,
        email: user.email,
        password: 'lorem-ipsum',
      });

      await expect(
        service.validateUser(user.email, user.password),
      ).rejects.toThrow(messages.UNAUTHORIZED);
    });

    it('returns user when email and password match', async () => {
      tracker.on.select('users').response({
        id: 1,
        email: user.email,
        password: user.password,
      });

      const retrievedUser = await service.validateUser(
        user.email,
        user.password,
      );

      expect(retrievedUser).toMatchObject({
        id: 1,
        email: user.email,
        password: user.password,
      });
    });
  });

  describe('createActivationToken()', () => {
    it('creates activation token', async () => {
      const expectedToken = 'random-hex-string';

      Object.defineProperty(global, 'crypto', {
        value: {
          randomBytes: () => ({
            toString: () => expectedToken,
          }),
        },
      });

      const expectedTokenResponse = {
        userId: 1,
        token: expectedToken,
        validUntil: new Date().toString(),
      };
      tracker.on
        .insert('user_activation_tokens')
        .response([expectedTokenResponse]);

      const userEntity = new UserEntity(user);
      const savedToken = await service.createActivationToken(userEntity);

      expect(savedToken).toMatchObject(expectedTokenResponse);
    });
  });
});
