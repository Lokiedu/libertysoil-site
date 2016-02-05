export async function up(knex, Promise) {
  await knex.raw('ALTER TABLE posts ADD fully_published_at timestamp without time zone');
  await knex.raw('UPDATE posts SET fully_published_at = created_at');
}

export async function down(knex, Promise) {
  await knex.table('posts', function (table) {
    table.dropColumn('fully_published_at');
  });
}
