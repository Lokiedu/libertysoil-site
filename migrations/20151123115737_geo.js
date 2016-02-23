export async function up(knex, Promise) {

  await knex.schema.createTable('geonames_countries', function(table) {
    table.string('iso_alpha2', 2).primary();
    table.string('iso_alpha3', 3);
    table.integer('iso_numeric');
    table.text('fips_code');
    table.text('name');
    table.text('capital');
    table.float('areainsqkm');
    table.integer('population');
    table.text('continent');
    table.text('tld');
    table.text('currencycode');
    table.text('currencyname');
    table.text('phone');
    table.text('postalcode');
    table.text('postalcoderegex');
    table.text('languages');
    table.jsonb('neighbors');
  });

  await knex.schema.createTable('geonames_cities', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name');
    table.text('asciiname');
    table.jsonb('alternatenames');
    table.float('latitude');
    table.float('longitude');
    table.text('fclass');
    table.text('fcode');
    table.text('country');
    table.text('cc2');
    table.text('admin1');
    table.text('admin2');
    table.text('admin3');
    table.text('admin4');
    table.integer('population');
    table.integer('elevation');
    table.integer('gtopo30');
    table.text('timezone');
    table.date('moddate');
  });

}

export async function down(knex, Promise) {
  await knex.schema.dropTable('geonames_cities');
  return knex.schema.dropTable('geonames_countries');
}
