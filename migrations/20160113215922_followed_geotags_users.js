export async function up(knex, Promise) {
  await knex.schema.createTable('followed_geotags_users', function (table) {
    table.uuid('geotag_id')
      .references('id').inTable('geotags').onDelete('cascade').onUpdate('cascade');
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.index(['geotag_id', 'user_id']);
  })
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('followed_geotags_users');
}
