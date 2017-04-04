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
import { mount, shallow } from 'enzyme';
import i from 'immutable';

import { expect, React } from '../../../test-helpers/expect-unit';
import { UnwrappedSchoolPage } from '../../../src/pages/school';
import { TAG_SCHOOL } from '../../../src/consts/tags';
import TagHeader from '../../../src/components/tag-header';
import NotFound from '../../../src/pages/not-found';

describe('School page', () => {
  // before(() => {
  //   sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });

  it('renders nothing if school hasn\'t been loaded yet', () => {
    const wrapper = shallow(
      <UnwrappedSchoolPage
        comments={i.Map()}
        is_logged_in={false}
        params={{ school_name: 'test' }}
        posts={i.Map()}
        school_posts={i.Map()}
        schools={i.Map()}
        users={i.Map()}
      />
    );

    return expect(wrapper.equals(null), 'to be true');
  });

  // FIXME: Temporarily turned off. Relies on the console.error stub.
  xit('MUST report an error for invalid school object', () => {
    expect(() => {
      shallow(
        <UnwrappedSchoolPage
          comments={i.Map()}
          is_logged_in={false}
          params={{ school_name: 'test' }}
          school_posts={i.Map()}
          schools={i.fromJS([{ url_name: 'test' }])}
          users={i.Map()}
        />
      );
    }, 'to error');
  });

  it('renders default school description if no description provided', () => {
    const wrapper = mount(
      <TagHeader
        is_logged_in={false}
        tag={i.fromJS({ url_name: 'test', id: '1', name: 'test' })}
        type={TAG_SCHOOL}
        users={i.Map()}
      />
    );

    expect(wrapper.text(), 'to contain', 'No information provided...');
  });

  it('renders school description', () => {
    const wrapper = mount(
      <TagHeader
        is_logged_in={false}
        tag={i.fromJS({ url_name: 'test', id: '1', description: 'test description' })}
        type={TAG_SCHOOL}
        users={i.Map()}
      />
    );

    expect(wrapper.text(), 'to contain', 'test description');
  });
});


describe('test', () => {
  // before(() => {
  //   sinon.stub(console, 'error', (warning) => null );
  // });

  // after(() => {
  //   console.error.restore();
  // });

  it('renders <NotFound /> if no school found', () => {
    const wrapper = shallow(
      <UnwrappedSchoolPage
        comments={i.Map()}
        is_logged_in={false}
        params={{ school_name: 'test' }}
        school_posts={i.Map()}
        schools={i.fromJS([{ url_name: 'test' }])}
        users={i.Map()}
      />);

    expect(wrapper.contains(<NotFound />), 'to be true');
  });
});
