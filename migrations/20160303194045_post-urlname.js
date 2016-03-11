import slug from 'slug';

import { initBookshelfFromKnex } from '../src/api/db';


export async function up(knex, Promise) {
	await knex.schema.table('posts', table => {
    table.text('url_name').unique();
	});

  const bookshelf = initBookshelfFromKnex(knex);
  const Post = bookshelf.model('Post');

  const Posts = bookshelf.collection('Posts');
  const posts = new Posts();

  const result = await posts.fetch({withRelated: ['user']});

  for (const post of result.models) {
    if (Post.typesWithoutPages.includes(post.get('type'))) {
      continue;
    }

    const title = await Post.titleFromText(post.get('text'), post.related('user').get('fullName'));
    const urlName = `${slug(title)}-${post.get('id')}`;

    const more = {...post.get('more'), pageTitle: title};
    post.set('more', more);
    post.set('url_name', urlName);

    await post.save(null, {method: 'update'});
  }
}

export async function down(knex, Promise) {
	await knex.schema.table('posts', table => {
		table.dropColumn('url_name');
	});
}
