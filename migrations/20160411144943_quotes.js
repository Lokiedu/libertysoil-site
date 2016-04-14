export async function up(knex, Promise) {
  await knex.schema.createTable('quotes', (table) => {
    table.increments('id');
    table.string('first_name');
    table.string('last_name');
    table.string('avatar_url');
    table.text('text');
    table.text('description');
    table.text('link');
    table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    table.timestamp('updated_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
  });
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('quotes');
}
