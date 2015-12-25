/*eslint-env node, mocha */
/*global $dbConfig */
import uuid from 'uuid';
import expect from '../../test-helpers/expect';
import app from '../../index';

import initBookshelf from '../../src/api/db';
import { login, createPost } from '../../test-helpers/api';
import Controller from '../../src/api/controller';


let bookshelf = initBookshelf($dbConfig);

let Post = bookshelf.model('Post');

let User = bookshelf.model('User');

const Password = "testerPassword"

describe('Post metadata', () => {
	let user;
	let sessionId;
	let post;

	beforeEach(async () => {
		await bookshelf.knex('users').del();
		await bookshelf.knex('posts').del();
		user = await User.create('test', 'test', 'test@example.com');
		sessionId = await login('test', 'test');
		let postId = await createPost(sessionId, 'short_text', 'Lorem ipsum dolor sit amet, consectetur adipisicing');
		post = await Post.where({id: postId}).fetch();
	});

	afterEach(async () => {
		await user.destroy();
		await post.destroy();
	});
	describe('Post.more.pageTitle', () => {
		it('post.more must have pageTitle property', async () => {
			expect(post.attributes.more, 'to have property', 'pageTitle');
		})

		it('must have user name', async () => {
			let user = await post.related('user').fetch();

			expect(post.attributes.more.pageTitle, 'to contain', user.attributes.username);
		});
	});
	describe('Post.url_name', () => {
		it('post must have url_name property', () => {
			expect(post.attributes, 'to have property', 'url_name');
		})
		it('must contain post id', () => {
			expect(post.attributes.url_name, 'to contain', post.id);
		})
	})
});
