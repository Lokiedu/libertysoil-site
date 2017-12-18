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
import { shallow } from 'enzyme';
import i from 'immutable';
import ReactShallowRenderer from 'react-test-renderer/shallow';

import { expect, React } from '../../../test-helpers/expect-unit';
import { UnwrappedPostPage } from '../../../src/pages/post';
import NotFound from '../../../src/pages/not-found';


describe('Post page', () => {
  const uuid4Example = '550e8400-e29b-41d4-a716-446655440000';

  it('MUST render nothing when post hasn\'t been fetched yet', () => {
    const wrapper = shallow(
      <UnwrappedPostPage
        comments={i.Map()}
        is_logged_in={false}
        params={{ uuid: uuid4Example }}
        posts={i.Map()}
        users={i.Map()}
      />
    );

    return expect(wrapper.equals(null), 'to be true');
  });

  it('MUST render as <NotFound /> page when post doesn\'t exist', () => {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(
      <UnwrappedPostPage
        comments={i.Map()}
        is_logged_in={false}
        params={{ uuid: uuid4Example }}
        posts={i.fromJS({ [uuid4Example]: { error: true } })}
        users={i.Map()}
      />
    );

    return expect(renderer, 'to have rendered', <NotFound />);
  });
});
