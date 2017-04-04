export async function up(knex) {
  await knex.schema.createTable('labels', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').unique();
  });

  await knex.schema.createTable('labels_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('label_id')
      .references('id').inTable('labels').onDelete('cascade').onUpdate('cascade');
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('labels_posts');
  await knex.schema.dropTable('labels');
}
