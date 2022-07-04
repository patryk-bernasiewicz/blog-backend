import { Knex } from 'knex';

const TABLE_NAME = 'posts';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id');
    table.string('slug', 255).notNullable().unique();
    table.string('title', 255).notNullable();
    table.string('intro').notNullable();
    table.string('body').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.boolean('published').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}
