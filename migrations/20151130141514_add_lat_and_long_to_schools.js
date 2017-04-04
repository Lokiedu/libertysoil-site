export async function up(knex) {
  await knex.schema.table('schools', table => {
    table.decimal('lat');
    table.decimal('long');
  });
}

export async function down(knex) {
  await knex.schema.table('schools', table => {
    table.dropColumn('lat');
    table.dropColumn('long');
  });
}
