export async function up(knex, Promise) {
  await knex.schema.createTable('followed_labels_users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('label_id')
      .references('id').inTable('labels').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'label_id']);
  });
}

export async function down(knex, Promise) {
  return await knex.schema.dropTable('followed_labels_users');
}
