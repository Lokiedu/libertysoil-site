export async function up(knex, Promise) {
  await knex.schema.createTable('ignored_users', function (table) {
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('ignored_user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'ignored_user_id']);
  });
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('ignored_users');
}
