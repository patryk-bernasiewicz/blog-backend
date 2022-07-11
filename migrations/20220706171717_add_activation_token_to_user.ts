import { Knex } from 'knex';

const TOKENS_TABLE_NAME = 'user_activation_tokens';
const USERS_TABLE_NAME = 'users';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable(TOKENS_TABLE_NAME, (table) => {
      table.increments('id');
      table.integer('userId').notNullable();
      table.string('token', 255).notNullable();
      table.datetime('validUntil', { precision: 6 }).notNullable();
    })
    .alterTable(USERS_TABLE_NAME, (table) => {
      table.boolean('active').defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable(TOKENS_TABLE_NAME)
    .alterTable(USERS_TABLE_NAME, (table) => {
      table.dropColumn('active');
    });
}
