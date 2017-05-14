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
import React, { type Element } from 'react';

import { SEARCH_RESULTS } from '../../consts/search';
import type { RouterLocation } from '../../definitions/common';
import FilterLink from './filter-link';
import RedirectFilter from './redirect-filter';


type Props = {
  location: RouterLocation,
  fixedType?: string,
}

export default function SearchResultFilter({ location, fixedType }: Props) {
  let types: Element<any>[];
  if (fixedType) {
    const mixedQuery = { show: fixedType };
    types = SEARCH_RESULTS.map(type => {
      const value = type.value;
      return (
        <RedirectFilter
          isDefault={value === fixedType}
          key={value}
          location={location}
          mixedQuery={mixedQuery}
          redirectTo="/search"
          query={{ show: value }}
          title={type.name}
          combine={type.combine}
        />
      );
    });
  } else {
    types = SEARCH_RESULTS.map(type => (
      <FilterLink
        isDefault={type.isDefault}
        key={type.value}
        location={location}
        query={{ show: type.value }}
        title={type.name}
        combine={type.combine}
      />
    ));
  }

  return (
    <div className="aux-nav">
      {types}
    </div>
  );
}
