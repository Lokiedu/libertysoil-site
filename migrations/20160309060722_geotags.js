export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.renameColumn('country_id', 'geonames_country_id');
    table.renameColumn('city_id', 'geonames_city_id');
    table.renameColumn('continent', 'continent_code');
  });

  await knex.raw('ALTER TABLE geotags DROP CONSTRAINT geotags_country_id_foreign');
  await knex.raw('ALTER TABLE geotags DROP CONSTRAINT geotags_city_id_foreign');

  await knex.raw(`
    ALTER TABLE geotags
    ADD CONSTRAINT geotags_geonames_country_id_foreign FOREIGN KEY (geonames_country_id)
        REFERENCES public.geonames_countries (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
  `);
  await knex.raw(`
    ALTER TABLE geotags
    ADD CONSTRAINT geotags_geonames_city_id_foreign FOREIGN KEY (geonames_city_id)
        REFERENCES public.geonames_cities (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
  `);

  await knex.schema.table('geotags', function (table) {
    table.uuid('continent_id')
      .references('id').inTable('geotags');
    table.uuid('country_id')
      .references('id').inTable('geotags');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumn('continent_id');
    table.dropColumn('country_id');
  });

  await knex.schema.table('geotags', function (table) {
    table.renameColumn('geonames_country_id', 'country_id');
    table.renameColumn('geonames_city_id', 'city_id');
    table.renameColumn('continent_code', 'continent');
  });

  await knex.raw('ALTER TABLE geotags DROP CONSTRAINT geotags_geonames_country_id_foreign');
  await knex.raw('ALTER TABLE geotags DROP CONSTRAINT geotags_geonames_city_id_foreign');

  await knex.raw(`
    ALTER TABLE geotags
    ADD CONSTRAINT geotags_country_id_foreign FOREIGN KEY (country_id)
        REFERENCES public.geonames_countries (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
  `);
  await knex.raw(`
    ALTER TABLE geotags
    ADD CONSTRAINT geotags_city_id_foreign FOREIGN KEY (city_id)
        REFERENCES public.geonames_cities (id) MATCH SIMPLE
        ON UPDATE CASCADE ON DELETE CASCADE
  `);
}
