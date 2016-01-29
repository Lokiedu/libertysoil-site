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

import { CountryPage } from '../../../src/pages/country';
import NotFound from '../../../src/pages/not-found';


describe('CountryPage', function() {

  it('MUST renders country name from geo.countries', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<CountryPage geo={{countries: {'foo': {name: 'bar'}}}} params={{country: 'foo'}} />);

    return expect(renderer, 'to contain', <div className="tag_header">bar</div>);
  });

  it('MUST render <NotFound /> for non existing country', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<CountryPage geo={{countries: {'foo': {name: 'bar'}}}} params={{country: 'non-existing-key'}} />);

    return expect(renderer, 'to have rendered', <NotFound />);
  });

});
