const tables = ['geotags', 'hashtags', 'posts', 'comments', 'schools', 'users'];

export async function up(knex, Promise) {
  for (const tableName of tables) {
    await knex.schema.table(tableName, function (table) {
      table.specificType('_sphinx_id', 'BIGSERIAL');
      table.index('_sphinx_id');
    });
  }
}

export async function down(knex, Promise) {
  for (const tableName of tables) {
    await knex.schema.table(tableName, function (table) {
      table.dropIndex('_sphinx_id');
      table.dropColumns(['_sphinx_id'])
    });
  }
}
