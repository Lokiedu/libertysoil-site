export async function up(knex) {
  await knex.schema.table('hashtags', function (table) {
    table.jsonb('more');
  });

  await knex.schema.table('geotags', function (table) {
    table.jsonb('more');
  });
}

export async function down(knex) {
  await knex.schema.table('hashtags', function (table) {
    table.dropColumn('more');
  });


  await knex.schema.table('geotags', function (table) {
    table.dropColumn('more');
  });
}
