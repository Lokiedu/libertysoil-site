export async function up(knex, Promise) {
  await knex.schema.createTable('attachments', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('s3_url');
    // Generated file name
    table.text('s3_filename');
    // Original file name
    table.text('filename');
    // Parent attachment id
    table.uuid('original_id');
    table.uuid('user_id');
    table.integer('size');
    table.string('mime_type');
    table.jsonb('s3_metadata');
    table.jsonb('more');
    table.timestamp('created_at', true).defaultTo(knex.raw('now()'));
    table.timestamp('updated_at', true).defaultTo(knex.raw('now()'));
  });
}

export async function down(knex, Promise) {
  await knex.schema.dropTable('attachments');
}
