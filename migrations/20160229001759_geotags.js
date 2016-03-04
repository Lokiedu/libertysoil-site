export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.string('type');
    table.string('continent').comment('Continent code: AF, AS, EU, NA, OC, SA, AN');
    table.index('type');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumns(['type', 'continent']);
  });
}
