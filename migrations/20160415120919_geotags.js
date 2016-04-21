export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.float('lat');
    table.float('lon');
    table.float('land_mass');
  });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumns(['lat', 'lon', 'land_mass']);
  });
}
