/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { Map } from 'immutable';
import { createRenderer } from 'react-addons-test-utils';

import { expect, React } from '../../../../../../test-helpers/expect-unit';
import { GeotagPageHero } from '../../../../../../src/pages/base/tag';
import { PageHero } from '../../../../../../src/components/page';
import MapboxMap from '../../../../../../src/components/mapbox-map';


describe('Tag Cloud Page: GeotagPageHero', () => {
  it('should choose zoom-level depending on geotag-type', () => {
    const planet = Map({ type: 'Planet', lat: 1, lon: 1 });
    const country = Map({ type: 'Country', lat: 1, lon: 1 });
    const adminDivision = Map({ type: 'AdminDivision1', lat: 1, lon: 1 });
    const city = Map({ type: 'City', lat: 1, lon: 1 });

    const renderer = createRenderer();
    expect(renderer.render(<GeotagPageHero geotag={planet} />), 'to contain', <MapboxMap zoom={3} frozen />);
    expect(renderer.render(<GeotagPageHero geotag={country} />), 'to contain', <MapboxMap zoom={5} frozen />);
    expect(renderer.render(<GeotagPageHero geotag={adminDivision} />), 'to contain', <MapboxMap zoom={6} frozen />);
    expect(renderer.render(<GeotagPageHero geotag={city} />), 'to contain', <MapboxMap zoom={12} frozen />);
  });

  it('should render map for objects located at zero-coordinates', () => {
    const Greenwich = Map({ type: 'City', lat: 51.48, lon: 0 });

    const renderer = createRenderer();
    expect(renderer.render(<GeotagPageHero geotag={Greenwich} />), 'to contain', <MapboxMap zoom={12} frozen />);
  });

  it('should render image with shape for geotags representing continents', () => {
    const continent = Map({ type: 'Continent', lat: 1, lon: 1 });

    const renderer = createRenderer();
    expect(
      renderer.render(<GeotagPageHero geotag={continent} />),
      'to contain',
      <PageHero
        contentClassName="continent"
        url={'/images/geo/continents/undefined.svg'}
      />
    );
    expect(
      renderer.render(
        <GeotagPageHero geotag={continent.set('continent_code', 'EU')} />
      ),
      'to contain',
      <PageHero
        contentClassName="continent"
        url={'/images/geo/continents/EU.svg'}
      />
    );
  });
});
