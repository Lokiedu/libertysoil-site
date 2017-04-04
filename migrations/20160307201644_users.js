export async function up(knex) {
  await knex.schema.table('users', function (table) {
    table.index('username');
    table.index('email');
  });
}

export async function down(knex) {
  await knex.schema.table('users', function (table) {
    table.dropIndex('username');
    table.dropIndex('email');
  });
}
