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
import faker from 'faker';

import { expect, React } from '../../../test-helpers/expect-unit';
import TagDescription, { DESCRIPTION_LIMIT } from '../../../src/components/tag-description';


describe('TagHeader', () => {
  it('renders default description if no description provided', () => {
    const wrapper = shallow(<TagDescription />);

    expect(wrapper.text(), 'to contain', 'No information provided...');
  });

  it('renders shortened description and "show more"', () => {
    const lorem = faker.lorem.words(100);
    const wrapper = mount(<TagDescription description={lorem} />);

    expect(wrapper.text(), 'to contain', lorem.substr(0, DESCRIPTION_LIMIT - 3));
    expect(wrapper.containsMatchingElement(<a>show more</a>), 'to be true');
  });

  it(`renders full description if it doesn't exceed ${DESCRIPTION_LIMIT} characters`, () => {
    const text = 'test description';
    const wrapper = mount(<TagDescription description={text} />);

    expect(wrapper.text(), 'to contain', text);
    expect(wrapper.containsMatchingElement(<a>show more</a>), 'to be false');
  });
});
