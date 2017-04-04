export async function up(knex) {
  await knex.raw('ALTER TABLE geonames_cities ALTER COLUMN population TYPE integer USING (population::integer);');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE geonames_cities ALTER COLUMN population TYPE text USING (population::text);');
}
