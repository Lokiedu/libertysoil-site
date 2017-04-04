/*eslint-env node, mocha */
import { API_HOST } from '../../../src/config';
import { expect } from '../../../test-helpers/expect-unit';
import { renderVerificationTemplate, renderWelcomeTemplate, renderNewCommentTemplate }  from '../../../src/email-templates/index';

describe('Email templates:', function () {
  it('Verification template exist', async function () {
    const template = await renderVerificationTemplate(new Date());

    expect(template, 'to be a string');
  });

  it('Welcome template exist', async function () {
    const template = await renderWelcomeTemplate(new Date());

    expect(template, 'to be a string');
  });

  describe('#renderNewCommentTemplate', function () {
    const comment = {
      text: 'Test comment text',
      post_id: 1
    };

    const commentAuthor = {
      username: 'JohnDoe',
      more: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: {
          url: 'http://avatars.test/avatar.png'
        }
      }
    };

    const post = {
      id: 1,
      more: {
        pageTitle: 'Hello world!'
      }
    };

    const postAuthor = {
      more: {
        avatar: {
          url: 'http://avatars.test/avatar2.png'
        }
      }
    };

    let template;

    before(async function () {
      template = await renderNewCommentTemplate(comment, commentAuthor, post, postAuthor);
    });

    it('renders link to the author', function () {
      expect(
        template,
        'when parsed as HTML',
        'queried for first', '#comment-author-link',
        'to have attributes', { href: `${API_HOST}/user/${commentAuthor.username}` }
      );

      expect(
        template,
        'when parsed as HTML',
        'queried for first', '#comment-author-link',
        'to have text', 'John Doe'
      );
    });

    it('renders link to the post', function () {
      expect(
        template,
        'when parsed as HTML',
        'queried for first', '#post-link',
        'to have attributes', { href: `${API_HOST}/post/${post.id}` }
      );

      expect(
        template,
        'when parsed as HTML',
        'queried for first', '#post-link',
        'to have text', post.more.pageTitle
      );
    });

    it('renders the comment', function () {
      expect(
        template,
        'when parsed as HTML',
        'queried for first', '.page__content_text-comment',
        'to have text', comment.text
      );
    });
  });
});
