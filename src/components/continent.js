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
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';

import CONTINENTS from '../consts/continents';
import TagCloud from './tag-cloud';

const Continent = ({ code, count, geotags }) => {
  const imageUrl = `/images/geo/continents/${code}.svg`;
  const name = CONTINENTS[code].name;
  const url_name = CONTINENTS[code].url_name;

  return (
    <div
      className="layout__row continent"
      style={{
        backgroundImage: `url(${imageUrl})`,
        minHeight: '200px'
      }}
    >
      <Link className="continent__title" to={`/geo/${url_name}`}>
        {name} <span className="continent__amount">({count})</span>
      </Link>
      <div className="layout__row">
        <TagCloud geotags={geotags} showPostCount />
      </div>
    </div>
  );
};

Continent.propTypes = {
  code: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  geotags: ArrayOfGeotagsPropType.isRequired
};

export default Continent;
