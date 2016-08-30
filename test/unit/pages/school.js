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

import { expect, React } from '../../../test-helpers/expect-unit';
import { SchoolPage } from '../../../src/pages/school';
import { TAG_SCHOOL } from '../../../src/consts/tags';
import TagHeader from '../../../src/components/tag-header';
import NotFound from '../../../src/pages/not-found';

describe('School page', () => {
  it('renders nothing if school hasn\'t been loaded yet', () => {
    const wrapper = shallow(
      <SchoolPage
        comments={{}}
        is_logged_in={false}
        params={{ school_name: 'test' }}
        posts={{}}
        school_posts={{}}
        schools={{}}
        users={{}}
      />
    );

    return expect(wrapper.equals(null), 'to be true');
  });

  it('MUST report an error for invalid school object', () => {
    let errorCalls = 0;

    try {
      shallow(
        <SchoolPage
          comments={{}}
          is_logged_in={false}
          params={{ school_name: 'test' }}
          school_posts={{}}
          schools={[{ url_name: 'test' }]}
          users={{}}
        />
      );
    } catch (e) {
      ++errorCalls;
    }

    expect(errorCalls, 'to be', 1);
  });

  it('renders <NotFound /> if no school found', () => {
    let errorCalls = 0;

    const error = console.error;
    // consider using Sinon (spy) or Jasmine (spyOn) instead
    console.error = () => { ++errorCalls; };

    // schools[0] doesn't satisfy SchoolPage.propTypes
    // shallow() throws an exception after normal console.error
    const wrapper = shallow(
      <SchoolPage
        comments={{}}
        is_logged_in={false}
        params={{ school_name: 'test' }}
        school_posts={{}}
        schools={[{ url_name: 'test', name: 'test' }]}
        users={{}}
      />
    );

    console.error = error;
    expect(wrapper.contains(<NotFound />), 'to be true');
  });

  it('renders default school description if no description provided', () => {
    const wrapper = mount(
      <TagHeader
        is_logged_in={false}
        tag={{ url_name: 'test', id: '1', name: "test" }}
        type={TAG_SCHOOL}
        users={{}}
      />
    );

    expect(wrapper.text(), 'to contain', 'No information provided...');
  });

  it('renders school description', () => {
    const wrapper = mount(
      <TagHeader
        is_logged_in={false}
        tag={{ url_name: 'test', id: '1', description: 'test description' }}
        type={TAG_SCHOOL}
        users={{}}
      />
    );

    expect(wrapper.text(), 'to contain', 'test description');
  });
});
