export async function up(knex) {
  return knex.schema.createTable('favourites', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id')
      .references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });
}

export async function down(knex) {
  return knex.schema.dropTable('favourites');
}
