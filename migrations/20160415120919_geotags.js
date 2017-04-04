export async function up(knex) {
  await knex.schema.table('geotags', function (table) {
    table.float('lat');
    table.float('lon');
    table.float('land_mass');
  });
}

export async function down(knex) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumns(['lat', 'lon', 'land_mass']);
  });
}
