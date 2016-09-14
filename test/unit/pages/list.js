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
import { TestUtils, expect, React } from '../../../test-helpers/expect-unit';
import Helmet from 'react-helmet';
import uuid from 'uuid';
import sinon from 'sinon';

import { List } from '../../../src/pages/list';
import Header from '../../../src/components/header';
import Footer from '../../../src/components/footer';
import HeaderLogo from '../../../src/components/header-logo';
import River from '../../../src/components/river_of_posts';
import Sidebar from '../../../src/components/sidebar';
import SidebarAlt from '../../../src/components/sidebarAlt';
import AddedTags from '../../../src/components/post/added-tags';
import Breadcrumbs from '../../../src/components/breadcrumbs/breadcrumbs';
import SideSuggestedUsers from '../../../src/components/side-suggested-users';
import CreatePost from '../../../src/components/create-post';

describe('List page with redux', () => {
  before(() => {
    sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  });

  after(() => {
    console.error.restore();
  });

  it('MUST render important components', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <List
        comments={{}}
        create_post_form={{ text: 'foo' }}
        current_user={{
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
        }}
        is_logged_in
        users={[]}
        posts={{}}
        river={[]}
        schools={{}}
        ui={{ progress: {} }}
      />
    );

    return expect(renderer, 'to have rendered', <div></div>);
  });
});
