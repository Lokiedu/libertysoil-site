export async function up(knex, Promise) {
  await knex.raw(`ALTER TABLE "users" ADD COLUMN reset_password_hash VARCHAR(40)`);
  return knex.raw(`COMMENT ON COLUMN users.reset_password_hash is 'SHA-1 for reset password feature'`);
}

export async function down(knex, Promise) {
  return knex.raw(`ALTER TABLE "users" DROP "reset_password_hash"`);
}
