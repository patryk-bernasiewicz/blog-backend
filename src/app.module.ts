import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nestjs-knex';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MailingModule } from './mailing/mailing.module';

const configKeys = {
  db: {
    client: 'DATABASE_CLIENT',
    name: 'DATABASE_NAME',
    host: 'DATABASE_HOST',
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    port: 'DATABASE_PORT',
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        config: {
          client: configService.get(configKeys.db.client),
          useNullAsDefault: true,
          connection: {
            host: configService.get(configKeys.db.host),
            user: configService.get(configKeys.db.username),
            password: configService.get(configKeys.db.password),
            port: Number(configService.get(configKeys.db.port)),
            database: configService.get(configKeys.db.name),
          },
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MailingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
