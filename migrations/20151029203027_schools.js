export async function up(knex, Promise) {
  await knex.schema.createTable('schools', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('url_name').unique();
    table.text('name');
    table.text('description');
    table.timestamp('created_at', true).defaultTo(knex.raw('now()'));
    table.timestamp('updated_at', true).defaultTo(knex.raw('now()'));
    table.jsonb('more');
  });

  await knex.schema.createTable('posts_schools', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('post_id')
      .references('id').inTable('posts').onDelete('cascade').onUpdate('cascade');
    table.uuid('school_id')
      .references('id').inTable('schools').onDelete('cascade').onUpdate('cascade');
    table.boolean('visible').defaultTo(true);
  });
};

export async function down(knex, Promise) {
  await knex.schema.dropTable('posts_schools');
  await knex.schema.dropTable('schools');
};
