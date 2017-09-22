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
import PropTypes from 'prop-types';

import CONTINENTS from '../consts/continents';

import { mapOfValues, uuid4, date, url } from './common';
import { TagMore } from './tags';

const continentCodes = Object.keys(CONTINENTS);

const geotagShape = {
  admin1_code: PropTypes.string,
  admin1_id: uuid4,
  continent_code: PropTypes.oneOf(continentCodes),
  continent_id: uuid4,
  country_code: PropTypes.string,
  country_id: uuid4,
  created_at: date.isRequired,
  geonames_admin1_id: PropTypes.number,
  geonames_city_id: PropTypes.number,
  geonames_country_id: PropTypes.number,
  geonames_id: PropTypes.string,
  id: uuid4.isRequired,
  land_mass: PropTypes.number,
  lat: PropTypes.number,
  lon: PropTypes.number,
  more: TagMore,
  name: PropTypes.string.isRequired,
  post_count: PropTypes.number.isRequired,
  type: PropTypes.string, // oneOf("Country", ...)
  updated_at: date.isRequired,
  url_name: url.isRequired
};

geotagShape.admin = PropTypes.shape(geotagShape);
geotagShape.continent = PropTypes.shape(geotagShape);
geotagShape.country = PropTypes.shape(geotagShape);

export const Geotag = PropTypes.shape(geotagShape);
export const ArrayOfGeotags = PropTypes.arrayOf(Geotag);
export const MapOfGeotags = mapOfValues(Geotag);
