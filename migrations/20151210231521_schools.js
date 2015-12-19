export async function up(knex, Promise) {
  await knex.schema.table('schools', (table) => {
    table.dropColumns('lat', 'long');
  });

  await knex.schema.table('schools', (table) => {
    table.decimal('lat', 10, 8);
    table.decimal('lon', 11, 8);
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('schools', (table) => {
    table.dropColumns('lat', 'lon');
  });

  await knex.schema.table('schools', (table) => {
    table.decimal('lat');
    table.decimal('long');
  });
}
