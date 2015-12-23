export async function up(knex, Promise) {
  await knex.schema.createTable('followed_schools_users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('school_id')
      .references('id').inTable('schools').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'school_id']);
  });
}

export async function down(knex, Promise) {
  return await knex.schema.dropTable('followed_schools_users');
}
