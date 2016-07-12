/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import { mount } from 'enzyme';
import { v4 as uuid4 } from 'uuid';

import { expect, React } from '../../../test-helpers/expect-unit';
import { TAG_LOCATION, TAG_HASHTAG } from '../../../src/consts/tags';

import TagEditForm from '../../../src/components/tag-edit-form/tag-edit-form';

describe('TagEditForm', () => {
  const date = new Date().toString();
  const uuid = uuid4();
  const saveHandler = () => {};

  describe('GeotagEditForm', () => {
    it('MUST render description field with correct initial data', () => {
      const description = 'Geotag test description';
      const geotag = {
        created_at: date,
        id: uuid,
        more: { description },
        name: 'test',
        updated_at: date,
        url_name: 'test',
      };

      const wrapper = mount(
        <TagEditForm
          messages={[]}
          processing={false}
          saveHandler={saveHandler}
          tag={geotag}
          triggers={{}}
          type={TAG_LOCATION}
        />
      );

      const fieldWrapper = wrapper.find('textarea[name="description"]');
      expect(fieldWrapper.length, 'to be', 1);

      return expect(fieldWrapper.text(), 'to be', description);
    });
  });

  describe('HashtagEditForm', () => {
    it('MUST render description field with correct initial data', () => {
      const description = 'Hashtag test description';
      const hashtag = {
        created_at: date,
        id: uuid,
        more: { description },
        name: 'test',
        updated_at: date
      };

      const wrapper = mount(
        <TagEditForm
          messages={[]}
          processing={false}
          saveHandler={saveHandler}
          tag={hashtag}
          triggers={{}}
          type={TAG_HASHTAG}
        />
      );

      const fieldWrapper = wrapper.find('textarea[name="description"]');
      expect(fieldWrapper.length, 'to be', 1);

      return expect(fieldWrapper.text(), 'to be', description);
    });
  });
});
