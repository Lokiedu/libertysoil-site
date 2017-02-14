export async function up(knex) {
  await knex.schema.createTable('profile_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('cascade').onUpdate('cascade');
    table.text('text');
    table.text('html'); // Processed text
    table.text('type'); // User posts may have different types like: text, user pic change, background change, etc.
    table.jsonb('more');
    table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    table.timestamp('updated_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));

    table.index('user_id');
  });

  const users = await knex('users')
    .select(knex.raw("id, more->>'bio' as bio"))
    .whereRaw("coalesce(trim(more->>'bio'), '') != ''");

  const promises = [];
  for (const user in users) {
    promises.push(await knex('profile_posts').insert({
      text: user.bio,
      html: user.bio,
      user_id: user.id
    }));
  }

  await Promise.all(promises);
}

export async function down(knex) {
  await knex.schema.dropTable('profile_posts');
}
