export async function up(knex, Promise) {
  await knex.schema.dropTable('geonames_cities');  // dropping old version of table

  await knex.schema.createTable('geonames_cities', function(table) {
    table.integer('id').primary();
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
    table.text('population');
    table.text('elevation');
    table.text('gtopo30');
    table.text('timezone');
    table.date('moddate');
  });

  await knex.schema.createTable('posts_countries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('country_id', 2)
      .references('iso_alpha2').inTable('geonames_countries').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });

  return knex.schema.createTable('posts_cities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('city_id')
      .references('id').inTable('geonames_cities').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('posts_countries');
  await knex.schema.dropTable('posts_cities');
  await knex.schema.dropTable('geonames_cities');

  // restorin old version of table
  return knex.schema.createTable('geonames_cities', function(table) {
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
  })
}
