import { UserEntity } from '@/users/user.entity';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

const configKeys = {
  mailer: {
    sender: 'MAILER_SENDER',
  },
};

@Injectable()
export class MailingService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserActivationEmail(
    user: UserEntity,
    token: string,
  ): Promise<void> {
    return this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get(configKeys.mailer.sender),
      subject: 'Aktywuj konto na blogu',
      template: 'userActivationEmail',
      context: {
        username: user.displayName || user.username,
        token,
      },
    });
  }
}
