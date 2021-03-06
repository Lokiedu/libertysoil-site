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
import React from 'react';
import CONTINENTS from '../../consts/continents';
import type { RouterLocation } from '../../definitions/common';
import FilterLink from './filter-link';


export default function ContinentFilter({ location }: { location: RouterLocation }) {
  const continents = Object.keys(CONTINENTS).map(code => (
    <FilterLink
      key={code}
      location={location}
      query={{ continent: code }}
      title={CONTINENTS[code].name}
    />
  ));

  return (
    <div className="aux-nav">
      {continents}
    </div>
  );
}
