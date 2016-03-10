export async function up(knex, Promise) {
  await knex.raw('UPDATE "users" SET "username"=lower("username")');
}

export async function down(knex, Promise) {
  // No `down()` here, as it is a non-reversible operation
}
