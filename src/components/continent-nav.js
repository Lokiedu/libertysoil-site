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
import React from 'react';
import { Link } from 'react-router';

export default function ContinentNav({ countries, continent, continents }) {
  const continentElements = continents.map(continent => (
    <div className="aux-nav__item" key={continent.get('code')}>
      <Link
        activeClassName="aux-nav__link--active"
        className="aux-nav__link"
        to={`/geo/${continent.get('url_name')}`}
      >
        {continent.get('name')} ({continent.get('hierarchy_post_count')})
      </Link>
    </div>
  ));

  const countryElements = countries.map(country => (
    <div className="aux-nav__item" key={country.get('id')}>
      <Link
        activeClassName="aux-nav__link--active"
        className="aux-nav__link"
        to={`/geo/${country.get('url_name')}`}
      >
        {country.get('name')} ({country.get('hierarchy_post_count')})
      </Link>
    </div>
  ));

  return (
    <div>
      <div className="aux-nav">
        {continent &&
          <div className="aux-nav__item">
            <Link
              activeClassName="aux-nav__link--active"
              className="aux-nav__link"
              to={`/geo/${continent.get('url_name')}`}
            >
              All {continent.get('name')} ({continent.get('hierarchy_post_count')})
            </Link>
          </div>
        }
        {countryElements}
      </div>

      <div className="aux-nav">
        {continentElements}
      </div>
    </div>
  );
}

ContinentNav.displayName = 'ContinentNav';
