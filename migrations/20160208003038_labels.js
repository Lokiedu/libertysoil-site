export async function up(knex, Promise) {
  // To optimize searching by name.
  knex.raw('CREATE INDEX labels_name_text_pattern_idx ON labels (name text_pattern_ops)');
}

export async function down(knex, Promise) {
  knex.raw('DROP INDEX labels_name_text_pattern_idx');
}
