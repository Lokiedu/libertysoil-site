export async function up(knex) {
  await knex.schema.table('geotags', function (table) {
    table.integer('geonames_id');
  });
}

export async function down(knex) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumn('geonames_id');
  });
}
