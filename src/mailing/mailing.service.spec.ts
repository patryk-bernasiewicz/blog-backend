import { UserEntity } from '@/users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailingService } from './mailing.service';

describe('MailerService', () => {
  const sendMailMock = jest.fn();

  let service: MailingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        MailingService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: sendMailMock,
          },
        },
      ],
    }).compile();

    service = module.get<MailingService>(MailingService);
  });

  it('should send user activation email', async () => {
    const user = new UserEntity({
      id: 1,
      displayName: 'User',
      username: 'username',
      email: 'username@email.com',
    });
    const token = 'loremipsum';

    await service.sendUserActivationEmail(user, token);

    expect(sendMailMock).toHaveBeenCalledWith({
      context: {
        token,
        username: user.displayName,
      },
      from: undefined,
      subject: 'Aktywuj konto na blogu',
      template: 'userActivationEmail',
      to: user.email,
    });
  });
});
