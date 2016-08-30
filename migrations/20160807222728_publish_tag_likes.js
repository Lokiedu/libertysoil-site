export async function up(knex) {
  await knex('posts')
    .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
    .update('fully_published_at', knex.raw('"created_at"'));
}

export async function down(knex) {
  await knex('posts')
    .whereIn('type', ['hashtag_like', 'school_like', 'geotag_like'])
    .update('fully_published_at', null);
}
