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

 @flow
*/
import type { DateString, Integer, Map, UrlNode, Uuid4 } from './common';
import type { TagMore } from './tags';

export type GeotagId = Uuid4;

export type Continent = 'EU' | 'AS' | 'NA' | 'SA' | 'OC' | 'AF' | 'AN';

export type GeotagType = 'Planet' | 'Continent' | 'Country' | 'AdminDivision1' | 'City';

// recursive
export type Geotag = {
  admin: ?Geotag,
  admin1_code: ?string,
  admin1_id: ?GeotagId,
  continent: ?Geotag,
  continent_code: ?Continent,
  continent_id: ?GeotagId,
  country: ?Geotag,
  country_code: ?string,
  country_id: ?GeotagId,
  created_at: DateString,
  geonames_admin1_id: ?Integer,
  geonames_city_id: ?Integer,
  geonames_country_id: ?Integer,
  geonames_id: ?Integer,
  id: GeotagId,
  land_mass: ?number,
  lat: ?number,
  lon: ?number,
  more: ?TagMore,
  name: string,
  post_count: Integer,
  tsv: ?string,
  type: GeotagType,
  updated_at: DateString,
  url_name: UrlNode
};

export type MapOfGeotags = Map<GeotagId, Geotag>;
