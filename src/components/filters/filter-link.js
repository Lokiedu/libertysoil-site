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
import React from 'react';
import { Link } from 'react-router';
import { intersection } from 'lodash';


function getNewUrl(query, location) {
  return {
    ...location,
    query: {
      ...location.query,
      ...query
    }
  };
}

export default function FilterLink({ isDefault, title, query, location }) {
  const urlFunction = getNewUrl.bind(null, query);
  let activeClassName = 'aux-nav__link--active';
  let className = 'aux-nav__link';
  const isFilterSet = intersection(
    Object.keys(query),
    Object.keys(location.query)
  ).length > 0;

  // force active state
  if (isDefault && !isFilterSet) {
    className = `${className} ${activeClassName}`;
    activeClassName = null;
  }

  return (
    <div className="aux-nav__item">
      <Link
        activeClassName={activeClassName}
        className={className}
        to={urlFunction}
      >
        {title}
      </Link>
    </div>
  );
}
