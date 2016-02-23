
exports.up = async function(knex, Promise) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('users', function(table) {
    table.uuid('id').primary();
    table.text('username').unique();
    table.text('hashed_password');
    table.text('email').unique();
    table.timestamp('created_at', true).defaultTo(knex.raw('now()'));
    table.timestamp('updated_at', true).defaultTo(knex.raw('now()'));
    table.jsonb('more');
  });

  await knex.schema.createTable('posts', function(table) {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.text('text');
    table.text('type');
    table.timestamp('created_at', true).defaultTo(knex.raw('now()'));
    table.timestamp('updated_at', true).defaultTo(knex.raw('now()'));
    table.jsonb('more');
  });

  return knex.schema.createTable('followers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('following_user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable('followers');
  await knex.schema.dropTable('posts');
  return knex.schema.dropTable('users');
};
