export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.integer('geonames_id');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumn('geonames_id');
  });
}
