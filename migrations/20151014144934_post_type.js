export async function up(knex) {
  await knex.raw(`UPDATE "posts" SET "type"='short_text' WHERE "type" IS NULL`);
  return knex.raw(`ALTER TABLE "posts" ALTER COLUMN "type" SET NOT NULL`);
}

export async function down(knex) {
  return knex.raw(`ALTER TABLE "posts" ALTER COLUMN "type" DROP NOT NULL`);
}
