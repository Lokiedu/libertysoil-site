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
/* global $dbConfig */
import React from 'react';
import { mount } from 'enzyme';

import initBookshelf from '../../../src/api/db';
import expect from '../../../test-helpers/expect';

import HashtagFactory from '../../../test-helpers/factories/hashtag';
import GeotagFactory from '../../../test-helpers/factories/geotag';

import HashtagSelect from '../../../src/components/add-tag-modal/form/hashtag/select';
import GeotagSelect from '../../../src/components/add-tag-modal/form/geotag/select';

const bookshelf = initBookshelf($dbConfig);
const Hashtag = bookshelf.model('Hashtag');
const Geotag = bookshelf.model('Geotag');

describe('AddTagModal', () => {
  describe('HashtagSelect', () => {
    const hashtags = Array(3);
    const names = ['knowledge', 'know', 'fox'];

    before(async () => {
      for (let i = 0; i < hashtags.length; ++i) {
        hashtags[i] = await new Hashtag(
          HashtagFactory.build({
            name: names[i]
          })
        ).save(null, { method: 'insert' });
      }
    });

    after(async () => {
      for (let i = 0; i < hashtags.length; ++i) {
        await hashtags[i].destroy();
      }
    });

    it('shows suggestions', (done) => {
      const wrapper = mount(<HashtagSelect />);
      const query = 'kno';

      wrapper.find('.autosuggest__input').simulate('change', { target: { value: query } });

      setTimeout(() => {
        try {
          expect(wrapper.state('suggestions').length, 'to equal', 2);
          done();
        } catch (e) {
          done(e);
        }
      }, 50);
    });
  });

  describe('GeotagSelect', () => {
    const geotags = Array(3);
    const names = ['New York City', 'New Orleans', 'Chicago'];

    before(async () => {
      for (let i = 0; i < geotags.length; ++i) {
        geotags[i] = await new Geotag(
          GeotagFactory.build({
            name: names[i]
          })
        ).save(null, { method: 'insert' });
      }
    });

    after(async () => {
      for (let i = 0; i < geotags.length; ++i) {
        await geotags[i].destroy();
      }
    });

    it('shows suggestions', (done) => {
      const wrapper = mount(<GeotagSelect />);
      const query = 'New';

      wrapper.find('.autosuggest__input').simulate('change', { target: { value: query } });

      setTimeout(() => {
        try {
          expect(wrapper.state('suggestions').length, 'to equal', 2);
          done();
        } catch (e) {
          done(e);
        }
      }, 50);
    });
  });
});
