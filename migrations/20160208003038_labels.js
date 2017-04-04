export async function up(knex) {
  // To optimize searching by name.
  await knex.raw('CREATE INDEX labels_name_text_pattern_idx ON labels (name text_pattern_ops)');
}

export async function down(knex) {
  await knex.raw('DROP INDEX labels_name_text_pattern_idx');
}
