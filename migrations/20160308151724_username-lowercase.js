export async function up(knex) {
  await knex.raw('UPDATE "users" SET "username"=lower("username")');
}

export async function down() {
  // No `down()` here, as it is a non-reversible operation
}
