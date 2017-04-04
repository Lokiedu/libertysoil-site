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
/*eslint-env node, mocha */
import uuid from 'uuid';
import i from 'immutable';

import { TestUtils, expect, React } from '../../../test-helpers/expect-unit';
import { UnwrappedListPage } from '../../../src/pages/list';

describe('UnwrappedListPage page with redux', () => {
  // before(() => {
  //   sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });

  it('MUST render important components', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <UnwrappedListPage
        comments={i.Map()}
        create_post_form={i.fromJS({ text: 'foo' })}
        current_user={i.fromJS({
          id: uuid.v4(),
          favourites: [],
          followed_geotags: [],
          followed_hashtags: [],
          followed_schools: [],
          geotags: [],
          hashtags: [],
          liked_geotags: [],
          liked_hashtags: [],
          liked_schools: [],
          likes: [],
          recent_tags: {
            geotags: [],
            hashtags: [],
            schools: []
          },
          schools: [],
          suggested_users: [],
          user: {
            created_at: '',
            id: uuid.v4(),
            more: {
              first_login: false
            },
            updated_at: '',
            username: 'test'
          }
        })}
        following={i.Map()}
        is_logged_in
        posts={i.Map()}
        river={i.List()}
        schools={i.Map()}
        ui={i.fromJS({ progress: {} })}
        users={i.Map()}
      />
    );

    return expect(renderer, 'to have rendered', <div />);
  });
});
