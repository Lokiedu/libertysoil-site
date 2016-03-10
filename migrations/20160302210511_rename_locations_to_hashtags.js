function renameForeignKey(table, knex) {
  return knex.schema.table(table, function (table) {
    table.renameColumn('label_id', 'hashtag_id');
  });
}

function revertForeignKey(table, knex) {
  return knex.schema.table(table, function (table) {
    table.renameColumn('hashtag_id', 'label_id');
  });
}

export async function up(knex, Promise) {
  await knex.schema.renameTable('labels', 'hashtags');
  await knex.schema.renameTable('labels_posts', 'hashtags_posts');
  await knex.schema.renameTable('liked_labels', 'liked_hashtags');
  await knex.schema.renameTable('followed_labels_users', 'followed_hashtags_users');

  await renameForeignKey('hashtags_posts', knex);
  await renameForeignKey('liked_hashtags', knex);
  await renameForeignKey('followed_hashtags_users', knex);

  await knex.schema.table('posts', function (table) {
    table.renameColumn('liked_label_id', 'liked_hashtag_id');
  });
}

export async function down(knex, Promise) {
  await knex.schema.renameTable('hashtags', 'labels');
  await knex.schema.renameTable('hashtags_posts', 'labels_posts');
  await knex.schema.renameTable('liked_hashtags', 'liked_labels');
  await knex.schema.renameTable('followed_hashtags_users', 'followed_labels_users');

  await revertForeignKey('labels_posts', knex);
  await revertForeignKey('liked_labels', knex);
  await revertForeignKey('followed_labels_users', knex);

  await knex.schema.table('posts', function (table) {
    table.renameColumn('liked_hashtag_id', 'liked_label_id');
  });
}
