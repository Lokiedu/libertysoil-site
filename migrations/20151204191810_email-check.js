export async function up(knex, Promise) {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN email_check_hash VARCHAR(40)`);
  return knex.raw(`COMMENT ON COLUMN users.email_check_hash is 'SHA-1 for checking new emails'`);
}

export async function down(knex, Promise) {
  return knex.raw(`ALTER TABLE "users" DROP "email_check_hash"`);
}
