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
import expect from '../../../test-helpers/expect';
import initBookshelf from '../../../src/api/db';
import GeotagFactory from '../../../test-helpers/factories/geotag';

const bookshelf = initBookshelf($dbConfig);
const Geotag = bookshelf.model('Geotag');

describe('Geotag', () => {
  let geotag;

  before(async () => {
    let geotagAttrs = GeotagFactory.build();
    geotag = await new Geotag(geotagAttrs).save(null, { method: 'insert' });
  });

  after(async () => {
    await geotag.destroy();
  });

  it('Should work', async () => {
    await expect(
      {url: `/api/v1/geotag/${geotag.get('name')}`, method: 'HEAD'},
      'to open successfully'
    );
  });
});
