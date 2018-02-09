export async function up(knex) {
  // Replace `mute_all_posts` with `comment_notifications`
  // Initialize`more.last_comment_notification_at` for each user.
  const users = await knex('users')
    .select('id', 'more');

  for (const user of users) {
    if (!user.more) {
      user.more = {};
    }

    let comment_notifications = 'on';
    if (user.more.mute_all_posts) {
      comment_notifications = 'off';
    }

    const more = {
      ...users.more,
      comment_notifications,
      last_comment_notification_at: new Date().toJSON()
    };

    delete more.mute_all_posts;

    await knex('users').where('id', user.id).update({ more });
  }
}

export async function down(knex) {
  const users = await knex('users')
    .select('id', 'more');

  for (const user of users) {
    if (!user.more) {
      user.more = {};
    }

    let mute_all_posts = false;
    if (user.more.comment_notifications === 'off') {
      mute_all_posts = false;
    }

    const more = {
      ...users.more,
      mute_all_posts,
    };

    delete more.last_comment_notification_at;
    delete more.comment_notifications;

    await knex('users').where('id', user.id).update({ more });
  }
}
