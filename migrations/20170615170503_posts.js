export async function up(knex) {
  await knex.schema.table('posts', table => {
    table.text('text_source');
    table.string('text_type');
  });

  // set text_source and more.shortText
  await knex.raw(`
    UPDATE posts SET
      text_source = text,
      more = jsonb_set(coalesce(more, jsonb_object('{}')), '{shortText}', to_jsonb((regexp_split_to_array(text, E'\\n{2,}'))[1]))
  `);
}

export async function down(knex) {
  await knex.schema.table('posts', table => {
    table.dropColumns(['text_source', 'text_type']);
  });
}
