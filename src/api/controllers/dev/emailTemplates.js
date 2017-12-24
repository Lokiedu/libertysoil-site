import path from 'path';
import faker from 'faker';
import moment from 'moment';
import md5 from 'md5';
import { renderFile } from 'ejs';
import { promisify } from 'bluebird';
import { API_HOST } from '../../../config';

const renderFileAsync = promisify(renderFile);

const commonTemplateParams = {
  host: API_HOST
};

function post({ numComments } = { numComments: 1 }) {
  return {
    id: faker.random.uuid(),
    title: faker.name.title(),
    url: `https://www.libertysoil.com/post/${faker.random.uuid()}`,
    author: user(),
    comments: Array.apply(null, Array(numComments)).map(() => comment()),
  };
}

function user({ avatarSize } = { avatarSize: 36 }) {
  return {
    name: faker.name.findName(),
    url: `https://www.libertysoil.com/u/${faker.random.uuid()}`,
    avatarUrl: `http://www.gravatar.com/avatar/${md5(faker.internet.email().toLowerCase())}?s=${avatarSize}&r=g&d=retro`,
  };
}

function comment() {
  return {
    text: faker.lorem.paragraph(),
    date: moment(faker.date.recent()).format('Do [of] MMMM YYYY'),
    author: user({ avatarSize: 17 }),
  };
}

const templateParams = {
  'new-comments.ejs': {
    posts: [
      post({ numComments: 3 }),
      post({ numComments: 1 }),
      post({ numComments: 4 }),
    ]
  },
  'new-comment.ejs': {
    post: post(),
  }
};

export async function renderEmailTemplate(ctx) {
  const filePath = path.join('src/email-templates', ctx.params.name);

  try {
    ctx.body = await renderFileAsync(filePath, {
      ...commonTemplateParams,
      ...templateParams[ctx.params.name],
    });
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    ctx.body = e.stack;
  }
}
