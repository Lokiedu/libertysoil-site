export async function up(knex) {
  await knex.schema.createTable('user_messages', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    table.timestamp('updated_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    table.uuid('sender_id').references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('reciever_id').references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.text('text');

    table.index(['sender_id', 'reciever_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('user_messages');
}
