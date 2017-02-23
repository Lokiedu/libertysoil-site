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
import { difference, intersection, mergeWith, isNil, uniq } from 'lodash';

function merge(combine, query, other) {
  const { except = [] } = combine;

  return mergeWith(query, other, (a, b) => {
    let filtered;
    if (Array.isArray(b)) {
      filtered = difference(b, except);
    } else if (except.find(s => s === b)) {
      filtered = [];
    } else {
      filtered = [b];
    }

    return uniq(filtered.concat(a));
  });
}

// here and below:
// early declarations, for-loops - performance reasons
function diff(_, exclude, inspect) {
  const result = {};
  let inspectProp, excludeProp, keys, l, i, k;
  for (i = 0, keys = Object.keys(inspect), l = keys.length; i < l; ++i) {
    k = keys[i];
    inspectProp = inspect[k];
    excludeProp = exclude[k];

    if (isNil(excludeProp)) {
      result[k] = inspectProp;
    } else {
      inspectProp = Array.isArray(inspectProp) ? inspectProp : [inspectProp];
      excludeProp = Array.isArray(excludeProp) ? excludeProp : [excludeProp];
      result[k] = difference(inspectProp, excludeProp);
    }
  }

  return result;
}

function checkFor(checker, query, other) {
  let queryProp, otherProp, keys, l, i, k;
  for (i = 0, keys = Object.keys(query), l = keys.length; i < l; ++i) {
    k = keys[i];
    queryProp = query[k];
    otherProp = other[k];

    if (isNil(otherProp)) {
      continue;
    }

    queryProp = Array.isArray(queryProp) ? queryProp : [queryProp];
    otherProp = Array.isArray(otherProp) ? otherProp : [otherProp];
    if (checker(otherProp, queryProp).length > 0) {
      return true;
    }
  }

  return false;
}

function getNewUrl(m, query, combine, location) {
  return {
    ...location,
    query: combine
      ? m(combine, query, location.query)
      : { ...location.query, ...query }
  };
}

export default function FilterLink({ isDefault, title, query, location, combine }) {
  let className = 'aux-nav__link';
  let urlFunction = getNewUrl.bind(null, merge, query, combine);

  if (isDefault && !checkFor(difference, query, location.query)) {
    className += ' aux-nav__link--active';
  } else if (checkFor(intersection, query, location.query)) { // is the filter active?
    urlFunction = getNewUrl.bind(null, diff, query, combine);
    className += ' aux-nav__link--active';
  }

  return (
    <div className="aux-nav__item">
      <Link className={className} to={urlFunction}>
        {title}
      </Link>
    </div>
  );
}
