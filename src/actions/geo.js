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
export const SET_COUNTRIES = 'SET_COUNTRIES';
export const ADD_COUNTRY = 'ADD_COUNTRY';
export const ADD_CITY = 'ADD_CITY';

export function setCountries(countries) {
  return {
    type: SET_COUNTRIES,
    payload: {
      countries
    }
  };
}

export function addCountry(country) {
  return {
    type: ADD_COUNTRY,
    payload: {
      country
    }
  };
}

export function addCity(city) {
  return {
    type: ADD_CITY,
    payload: {
      city
    }
  };
}
