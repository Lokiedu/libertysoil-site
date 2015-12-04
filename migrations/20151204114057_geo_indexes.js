export async function up(knex, Promise) {

    await knex.raw(`CREATE INDEX city_name_idx ON geonames_cities (asciiname);`);
    await knex.raw(`CREATE INDEX country_name_idx ON geonames_countries (name);`);

    return knex.raw(`ALTER TABLE geonames_cities ADD CONSTRAINT iso_alpha2 FOREIGN KEY (country) REFERENCES geonames_countries ON DELETE CASCADE;`);

}

export async function down(knex, Promise) {
    await knex.raw(`DROP INDEX IF EXISTS city_name_idx, country_name_idx;`);
    return knex.raw(`ALTER TABLE geonames_cities DROP CONSTRAINT IF EXISTS iso_alpha2`);

}
