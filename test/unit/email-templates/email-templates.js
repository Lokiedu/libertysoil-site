/*eslint-env node, mocha */
import faker from 'faker';
import { JSDOM } from 'jsdom';
import { API_HOST } from '../../../src/config';
import { expect } from '../../../test-helpers/expect-unit';
import { EmailTemplates } from '../../../src/email-templates';

describe('Email templates:', function () {
  const templates = new EmailTemplates();

  describe('new-comment.ejs', function () {
    const post = {
      id: '99e79372-2958-4ecb-8314-aa56a3dad326',
      more: {
        pageTitle: 'Post Title'
      },
      user: {
        username: 'post_author',
        gravatarHash: '123'
      },
      comments: [
        {
          text: 'Comment 1 text',
          created_at: new Date(2018, 0, 0).toJSON(),
          user: {
            fullName: 'Comment Author',
            username: 'comment_author',
            gravatarHash: '123'
          },
        },
      ]
    };

    let document;

    before(async function () {
      const template = await templates.renderNewCommentTemplate({ post });
      document = (new JSDOM(template)).window.document;
    });

    it('renders link to author', function () {
      expect(
        document.body,
        'queried for first', '#comment-author-link',
        'to have attributes', { href: `${API_HOST}/user/${post.comments[0].user.username}` }
      );

      expect(
        document.body,
        'queried for first', '#comment-author-link',
        'to have text', 'Comment Author'
      );
    });

    it('renders link to post', function () {
      expect(
        document.body,
        'queried for first', '#post-link',
        'to have attributes', { href: `${API_HOST}/post/${post.id}` }
      );

      expect(
        document.body,
        'queried for first', '#post-link',
        'to have text', post.more.pageTitle
      );
    });

    it('renders comment', () => {
      expect(
        document.body,
        'queried for first', '.post_comment',
        'to satisfy',
        expect.it('to have text', expect.it('to contain', 'Comment 1 text'))
      );
    });
  });

  describe('new-comments.ejs', function () {
    const posts = [
      {
        id: '99e79372-2958-4ecb-8314-aa56a3dad326',
        more: {
          pageTitle: 'Post 1'
        },
        user: {
          fullName: faker.name.findName(),
          gravatarHash: '123'
        },
        comments: [
          {
            text: 'Post 1 Comment 1 text',
            created_at: new Date(2018, 0, 0).toJSON(),
            user: {
              fullName: faker.name.findName(),
              gravatarHash: '123'
            },
          },
          {
            text: 'Post 1 Comment 2 text',
            created_at: new Date(2018, 0, 0).toJSON(),
            user: {
              fullName: faker.name.findName(),
              gravatarHash: '123'
            },
          }
        ]
      },
      {
        id: '99e79372-2958-4ecb-8314-aa56a3dad326',
        more: {
          pageTitle: 'Post 2'
        },
        user: {
          name: 'John Doe',
          gravatarHash: '123'
        },
        comments: [
          {
            text: 'Post 2 Comment 1 text',
            created_at: new Date(2018, 0, 0).toJSON(),
            user: {
              name: 'Commenter',
              gravatarHash: '123'
            },
          }
        ]
      },
    ];

    let document;

    before(async function () {
      const template = await templates.renderNewCommentsTemplate({ posts, since: faker.date.past() });
      document = (new JSDOM(template)).window.document;
    });

    it('renders all comments', () => {
      expect(
        document.body,
        'queried for', '.post_comment',
        'to satisfy', [
          expect.it('to have text', expect.it('to contain', 'Post 1 Comment 1 text')),
          expect.it('to have text', expect.it('to contain', 'Post 1 Comment 2 text')),
          expect.it('to have text', expect.it('to contain', 'Post 2 Comment 1 text')),
        ]
      );
    });

    it('renders multiple posts', () => {
      expect(
        document.body,
        'queried for', '.post',
        'to satisfy', [
          expect.it('to have text', expect.it('to contain', 'Post 1')),
          expect.it('to have text', expect.it('to contain', 'Post 2')),
        ]
      );
    });
  });
});
