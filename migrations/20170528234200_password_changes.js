export async function up(knex) {
  await knex.schema.createTable('password_changes', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').index();
    table.text('prev_hashed_password');
    table.string('ip').comment('Should we use inet or cidr instead of string here?');
    table.enu('event_type', ['change', 'reset']);
    table.timestamp('created_at', true).defaultTo(knex.raw("(now() at time zone 'utc')"));
    table.jsonb('more');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('password_changes');
}
