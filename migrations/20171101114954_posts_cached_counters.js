export async function up(knex) {
  async function createTriggers(table, countColName) {
    // Create triggers that update post statistics: like_count, fav_count, comment_count.
    await knex.raw(`
      CREATE OR REPLACE FUNCTION get_post_score(like_count int, fav_count int, comment_count int) RETURNS float AS $$
      BEGIN
        RETURN like_count + fav_count + comment_count;
      END;
      $$ LANGUAGE 'plpgsql';

      CREATE OR REPLACE FUNCTION cache_post_${countColName}_on_insert() RETURNS trigger AS $$
      BEGIN
        UPDATE posts SET
          ${countColName} = ${countColName} + 1
          WHERE id = NEW.post_id;
        RETURN NULL;
      END;
      $$ LANGUAGE 'plpgsql';

      CREATE TRIGGER ${table}_on_insert_update_count_on_posts
        AFTER INSERT ON ${table}
        FOR EACH ROW
        EXECUTE PROCEDURE cache_post_${countColName}_on_insert();

      CREATE OR REPLACE FUNCTION cache_post_${countColName}_on_delete() RETURNS trigger AS $$
      BEGIN
        UPDATE posts SET
          ${countColName} = GREATEST(${countColName} - 1, 0)
          WHERE id = OLD.post_id;
        RETURN NULL;
      END;
      $$ LANGUAGE 'plpgsql';

      CREATE TRIGGER ${table}_on_delete_update_count_on_posts
        AFTER DELETE ON ${table}
        FOR EACH ROW
        EXECUTE PROCEDURE cache_post_${countColName}_on_delete();
    `);
  }

  // Add timestamps to likes and favourites; and indices to optimize counting.
  await knex.schema.table('likes', function (table) {
    table.timestamp('created_at').default(knex.raw("(now() at time zone 'utc')"));
    table.index(['post_id', 'created_at']);
  });

  await knex.schema.table('favourites', function (table) {
    table.timestamp('created_at').default(knex.raw("(now() at time zone 'utc')"));
    table.index(['post_id', 'created_at']);
  });

  await knex.schema.table('comments', function (table) {
    table.index(['post_id', 'created_at']);
  });

  await knex.schema.table('posts', function (table) {
    // all time stats. Updated with triggers.
    table.integer('like_count').default(0);
    table.integer('fav_count').default(0);
    table.integer('comment_count').default(0);
    // last 30 days' stats. Updated in intervls.
    table.integer('new_like_count').default(0);
    table.integer('new_fav_count').default(0);
    table.integer('new_comment_count').default(0);
    // post score based on last 30 days' stats.
    table.float('score').default(0);
  });

  // Add triggers
  await createTriggers('likes', 'like_count');
  await createTriggers('favourites', 'fav_count');
  await createTriggers('comments', 'comment_count');

  // Calculate counters
  await knex.raw(`
    UPDATE posts SET
      like_count = (SELECT count(*) FROM likes WHERE post_id = posts.id),
      fav_count = (SELECT count(*) FROM favourites WHERE post_id = posts.id),
      comment_count = (SELECT count(*) FROM comments WHERE post_id = posts.id),
      new_like_count = (
        SELECT count(*) FROM likes WHERE
          post_id = posts.id AND
          created_at > (current_timestamp at time zone 'UTC')::date - 30
      ),
      new_fav_count = (
        SELECT count(*) FROM favourites WHERE
          post_id = posts.id AND
          created_at > (current_timestamp at time zone 'UTC')::date - 30
      ),
      new_comment_count = (
        SELECT count(*) FROM comments WHERE
          post_id = posts.id AND
          created_at > (current_timestamp at time zone 'UTC')::date - 30
      )
  `);

  // Calculate initial score
  await knex.raw(`
    UPDATE posts SET
      score = new_like_count + new_fav_count + new_comment_count;
  `);
}

export async function down(knex) {
  async function destroyTriggers(table, countColName) {
    await knex.raw(`
      DROP TRIGGER ${table}_on_insert_update_count_on_posts ON ${table};
      DROP FUNCTION cache_post_${countColName}_on_insert();
      DROP TRIGGER ${table}_on_delete_update_count_on_posts ON ${table};
      DROP FUNCTION cache_post_${countColName}_on_delete();
    `);
  }

  await destroyTriggers('likes', 'like_count');
  await destroyTriggers('favourites', 'fav_count');
  await destroyTriggers('comments', 'comment_count');

  await knex.raw(`DROP FUNCTION get_post_score(int, int, int)`);

  await knex.schema.table('posts', function (table) {
    table.dropColumns([
      'like_count', 'fav_count', 'comment_count',
      'new_like_count', 'new_fav_count', 'new_comment_count',
      'score'
    ]);
  });

  await knex.schema.table('likes', function (table) {
    table.dropColumn('created_at');
  });

  await knex.schema.table('favourites', function (table) {
    table.dropColumn('created_at');
  });

  await knex.schema.table('comments', function (table) {
    table.dropIndex(['post_id', 'created_at']);
  });
}
