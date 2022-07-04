import type { Knex } from 'knex';

import 'dotenv/config';

const {
  DATABASE_CLIENT,
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
} = process.env;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: DATABASE_CLIENT,
    connection: {
      database: DATABASE_NAME,
      host: DATABASE_HOST,
      port: Number(DATABASE_PORT),
      user: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
    },
  },
};

module.exports = config;
