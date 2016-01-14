export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumns('place_type', 'place_id');
    table.integer('country_id')
      .references('id').inTable('geonames_countries').onDelete('cascade').onUpdate('cascade');
    table.integer('city_id')
      .references('id').inTable('geonames_cities').onDelete('cascade').onUpdate('cascade');
    table.string('url_name').unique();
    table.index('url_name');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags_posts', function (table) {
    table.string('place_types');
    table.integer('place_id');
    table.dropColumns('url_name', 'city_id', 'country_id');
  });
}
