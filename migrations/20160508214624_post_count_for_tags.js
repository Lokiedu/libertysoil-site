export async function up(knex, Promise) {
  await knex.schema.table('hashtags', function (table) {
    table.integer('post_count').defaultTo(0);
  });

  await knex.schema.table('schools', function (table) {
    table.integer('post_count').defaultTo(0);
  });

  await knex.schema.table('geotags', function (table) {
    table.integer('post_count').defaultTo(0);
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('hashtags', function (table) {
    table.dropColumn('post_count');
  });

  await knex.schema.table('schools', function (table) {
    table.dropColumn('post_count');
  });

  await knex.schema.table('geotags', function (table) {
    table.dropColumn('post_count');
  });
}
