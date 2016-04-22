export async function up(knex, Promise) {
  await knex.schema.table('hashtags', function (table) {
    table.jsonb('more');
  });

  await knex.schema.table('geotags', function (table) {
    table.jsonb('more');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('hashtags', function (table) {
    table.dropColumn('more');
  });


  await knex.schema.table('geotags', function (table) {
    table.dropColumn('more');
  });
}
