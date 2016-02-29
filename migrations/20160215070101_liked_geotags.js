export async function up(knex, Promise) {
  return knex.schema.createTable('liked_geotags', function (table) {
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('geotag_id')
      .references('id').inTable('geotags').onDelete('cascade').onUpdate('cascade');
    table.index(['user_id', 'geotag_id']);
  });
}

export async function down(knex, Promise) {
  return knex.schema.dropTable('liked_geotags');
}
