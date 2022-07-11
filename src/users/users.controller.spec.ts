import { MailingService } from '@/mailing/mailing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDTO } from './createUser.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const token = 'loremipsum';
  const mockedUserService = {
    createUser: jest.fn().mockImplementation((user) => user),
    createActivationToken: jest.fn().mockResolvedValue(token),
  };
  const mockedMailingService = {
    sendUserActivationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockedUserService,
        },
        {
          provide: MailingService,
          useValue: mockedMailingService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('createUser()', () => {
    it('creates a user', async () => {
      const userDto: CreateUserDTO = {
        username: 'username',
        displayName: 'User Name',
        email: 'lorem@ipsum.com',
        password: 'password',
        confirmPassword: 'password',
      };
      const token = 'loremipsum';

      await controller.createUser(userDto);

      expect(mockedUserService.createUser).toHaveBeenCalledWith(userDto);
      expect(mockedUserService.createActivationToken).toHaveBeenCalledWith(
        userDto,
      );
      expect(mockedMailingService.sendUserActivationEmail).toHaveBeenCalledWith(
        userDto,
        token,
      );
    });
  });
});
