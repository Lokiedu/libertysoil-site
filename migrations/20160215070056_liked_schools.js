export async function up(knex) {
  return knex.schema.createTable('liked_schools', function (table) {
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('school_id')
      .references('id').inTable('schools').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'school_id']);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('liked_schools');
}
