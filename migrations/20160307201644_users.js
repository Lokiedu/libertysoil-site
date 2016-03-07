export async function up(knex, Promise) {
  await knex.schema.table('users', function (table) {
    table.index('username');
    table.index('email');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('users', function (table) {
    table.dropIndex('username');
    table.dropIndex('email');
  });
}
