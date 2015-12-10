export async function up(knex, Promise) {
  await knex.schema.createTable('images_schools', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id')
      .references('id').inTable('schools').onDelete('cascade').onUpdate('cascade');
    table.uuid('image_id')
      .references('id').inTable('attachments').onDelete('cascade').onUpdate('cascade');
    table.index(['school_id', 'image_id']);
  });
}

export async function down(knex, Promise) {
  return await knex.schema.dropTable('images_schools');
}
