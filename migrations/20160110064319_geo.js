// Changes the primary key of countries, drops unneeded junction tables
export async function up(knex, Promise) {
  await knex.schema.dropTable('posts_countries');
  await knex.schema.dropTable('posts_cities');
  await knex.raw(`ALTER TABLE geonames_cities DROP CONSTRAINT IF EXISTS iso_alpha2`);
  await knex.raw(`ALTER TABLE geonames_countries DROP CONSTRAINT IF EXISTS geonames_countries_pkey`);

  await knex.schema.table('geonames_countries', function(table) {
    table.increments('id').primary();
  });
}

export async function down(knex, Promise) {
  await knex.raw(`ALTER TABLE geonames_countries DROP CONSTRAINT geonames_countries_pkey`);
  await knex.raw(`ALTER TABLE geonames_countries DROP COLUMN id`);
  await knex.raw(`ALTER TABLE geonames_countries ADD CONSTRAINT geonames_countries_pkey PRIMARY KEY (iso_alpha2)`);
  await knex.raw(`ALTER TABLE geonames_cities ADD CONSTRAINT iso_alpha2 FOREIGN KEY (country) REFERENCES geonames_countries ON DELETE CASCADE;`);

  await knex.schema.createTable('posts_countries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('country_id', 2)
      .references('iso_alpha2').inTable('geonames_countries').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });

  await knex.schema.createTable('posts_cities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('city_id')
      .references('id').inTable('geonames_cities').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });
}
