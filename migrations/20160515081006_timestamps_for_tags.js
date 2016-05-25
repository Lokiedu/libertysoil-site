const tables = ['geotags', 'hashtags']; // schools already have timestamps
const junctionTables = ['geotags_posts', 'hashtags_posts', 'posts_schools'];

export async function up(knex, Promise) {
  for (const tableName of tables) {
    await knex.schema.table(tableName, function (table) {
      table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
      table.timestamp('updated_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    });
  }

  for (const tableName of junctionTables) {
    await knex.schema.table(tableName, function (table) {
      table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    });
  }
}

export async function down(knex, Promise) {
  for (const tableName of tables) {
    await knex.schema.table(tableName, function (table) {
      table.dropColumns(['created_at', 'updated_at']);
    });
  }

  for (const tableName of junctionTables) {
    await knex.schema.table(tableName, function (table) {
      table.dropColumn('created_at');
    });
  }
}
