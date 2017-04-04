export async function up(knex) {
  return knex.schema.createTable('liked_labels', function (table) {
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('label_id')
      .references('id').inTable('labels').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'label_id']);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('liked_labels');
}
