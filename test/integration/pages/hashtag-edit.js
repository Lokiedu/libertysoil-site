/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-env node, mocha */
/* global $dbConfig */
import { jsdom } from 'jsdom';
import qs from 'querystring';

import initBookshelf from '../../../src/api/db';
import { login } from '../../../test-helpers/api';
import expect from '../../../test-helpers/expect';
import HashtagFactory from '../../../test-helpers/factories/hashtag';
import UserFactory from '../../../test-helpers/factories/user';

const bookshelf = initBookshelf($dbConfig);
const Hashtag = bookshelf.model('Hashtag');
const User = bookshelf.model('User');

describe('HashtagEditPage', () => {
  let user, sessionId;

  before(async () => {
    const userAttrs = UserFactory.build();
    user = await User.create(userAttrs.username, userAttrs.password, userAttrs.email);
    await user.save({ email_check_hash: null }, { method: 'update' });

    sessionId = await login(userAttrs.username, userAttrs.password);
  });

  after(() => user.destroy());

  describe('when tag does not exist', () => {
    it('has 404 status and renders NotFound page', async () => {
      const context = await expect(
        { url: '/tag/fake-hashtag/edit', session: sessionId },
        'to open not found'
      );

      const document = jsdom(context.httpResponse.body);
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', 'Page not found at LibertySoil.org'
      );
    });
  });

  describe('when tag exists', () => {
    let tag;

    before(async () => {
      const tagAttrs = HashtagFactory.build();
      tag = await new Hashtag(tagAttrs).save(null, { method: 'insert' });
    });

    after(() => tag.destroy());

    it('renders normal HashtagEditPage', async () => {
      const tagName = tag.get('name');
      console.log(sessionId, tagName)
      const context = await expect(
        { url: `/tag/${qs.escape(tagName)}/edit`, session: sessionId },
        'to open successfully'
      );

      const document = jsdom(context.httpResponse.body);
      await expect(
        document.head,
        'queried for first', 'title',
        'to have text', `"${tagName}" posts on LibertySoil.org`
      );
    });
  });
});
