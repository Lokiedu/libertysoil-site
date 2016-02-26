export async function up(knex, Promise) {
  await knex.raw('ALTER TABLE geotags DROP CONSTRAINT geotags_url_name_unique');

  await knex.schema.table('geotags', function (table) {
    table.index('country_id');
    table.index('city_id');
  });
}

export async function down(knex, Promise) {
  await knex.raw('ALTER TABLE geotags ADD CONSTRAINT geotags_url_name_unique UNIQUE (url_name)');

  await knex.schema.table('geotags', function (table) {
    table.dropIndex('country_id');
    table.dropIndex('city_id');
  });
}
