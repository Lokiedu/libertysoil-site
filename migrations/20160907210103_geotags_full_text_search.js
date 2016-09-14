export async function up(knex) {
  await knex.raw('ALTER TABLE geotags ADD COLUMN tsv tsvector');
  await knex.raw('CREATE INDEX geotags_tsv_idx ON geotags USING gin(tsv)');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE geotags DROP COLUMN tsv');
}
