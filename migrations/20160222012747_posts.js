export async function up(knex, Promise) {
  return knex.schema.table('posts', function (table) {
    table.uuid('liked_label_id')
      .references('id').inTable('labels').onDelete('cascade').onUpdate('cascade');
    table.uuid('liked_school_id')
      .references('id').inTable('schools').onDelete('cascade').onUpdate('cascade');
    table.uuid('liked_geotag_id')
      .references('id').inTable('geotags').onDelete('cascade').onUpdate('cascade');
  });
}

export async function down(knex, Promise) {
  return knex.schema.table('posts', function (table) {
    table.dropColumns(['liked_label_id', 'liked_school_id', 'liked_geotag_id']);
  });
}
