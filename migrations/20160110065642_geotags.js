export async function up(knex, Promise) {
  await knex.schema.createTable('geotags', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name');
    // Both geonames_cities and geonames_countries use integers as ids.
    table.integer('place_id');
    table.string('place_type');
    table.index(['place_id', 'place_type']);
  });

  // To optimize searching by name.
  knex.raw('CREATE INDEX geotags_name_text_pattern_idx ON geotags (name text_pattern_ops)');

  await knex.schema.createTable('geotags_posts', function (table) {
    table.uuid('geotag_id')
      .references('id').inTable('geotags').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
    table.index(['geotag_id', 'post_id']);
  })
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('geotags_posts');
  await knex.schema.dropTable('geotags');
}
