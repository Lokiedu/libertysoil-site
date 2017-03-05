export async function up(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.integer('hierarchy_post_count')
      .defaultTo(0)
      .comment('Counter for both own posts and children\'\'s.');
  });

  // Move posts from the country 'Antarctica' to the continent 'Antarctica'.
  const antarcticaCountry = (await knex('geotags')
    .where({ name: 'Antarctica', type: 'Country' }))[0];
  const antarcticaContinent = (await knex('geotags')
    .where({ name: 'Antarctica', type: 'Continent' }))[0];

  if (antarcticaContinent && antarcticaCountry) {
    await knex('geotags_posts')
      .where('geotag_id', antarcticaCountry.id)
      .update('geotag_id', antarcticaContinent.id);
  }

  await knex('geotags')
    .where({ name: 'Antarctica', type: 'Country' })
    .update({ name: 'Antarctica (Country)', url_name: 'Antarctica-Country' });
}

export async function down(knex, Promise) {
  await knex.schema.table('geotags', function (table) {
    table.dropColumn('hierarchy_post_count');
  });

  await knex('geotags')
    .where({ name: 'Antarctica (Country)', type: 'Country' })
    .update({ name: 'Antarctica', url_name: 'Antarctica' });
}
