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
import EU from '../images/geo/continents/EU.svg';
import AS from '../images/geo/continents/AS.svg';
import NA from '../images/geo/continents/NA.svg';
import SA from '../images/geo/continents/SA.svg';
import OC from '../images/geo/continents/OC.svg';
import AF from '../images/geo/continents/AF.svg';
import AN from '../images/geo/continents/AN.svg';

export type Continents = {
  [string]: {|
    img_url: string,
    name: string,
    url_name: string,
  |}
};

const CONTINENTS: Continents = {
  EU: {
    name: 'Europe',
    url_name: 'Europe',
    img_url: EU,
  },
  AS: {
    name: 'Asia',
    url_name: 'Asia',
    img_url: AS,
  },
  NA: {
    name: 'North America',
    url_name: 'North-America',
    img_url: NA,
  },
  SA: {
    name: 'South America',
    url_name: 'South-America',
    img_url: SA,
  },
  OC: {
    name: 'Oceania',
    url_name: 'Oceania',
    img_url: OC,
  },
  AF: {
    name: 'Africa',
    url_name: 'Africa',
    img_url: AF,
  },
  AN: {
    name: 'Antarctica',
    url_name: 'Antarctica',
    img_url: AN,
  }
};

export default CONTINENTS;
