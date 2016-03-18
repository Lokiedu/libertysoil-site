export async function up(knex, Promise) {
  await knex.schema.createTable('geonames_admin1', function (table) {
    table.increments();
    table.string('name');
    table.string('asciiname');
    table.string('code');
    table.string('country_code');
    table.index('code');
  });

  await knex.schema.table('geotags', function (table) {
    table.string('country_code');
    table.string('admin1_code');
    table.uuid('admin1_id')
      .references('id').inTable('geotags');
    table.integer('geonames_admin1_id')
      .references('id').inTable('geonames_admin1');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumn('country_code');
    table.dropColumn('admin1_code');
    table.dropColumn('admin1_id');
    table.dropColumn('geonames_admin1_id');
  });

  await knex.schema.dropTable('geonames_admin1');
}
