export async function up(knex) {
  await knex.schema.createTable('post_subscriptions', (table) => {
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'post_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('post_subscriptions');
}
