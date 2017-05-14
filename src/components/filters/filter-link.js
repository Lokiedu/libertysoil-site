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
import { Link } from 'react-router';
import { difference, intersection, mergeWith, isNil, uniq } from 'lodash';

import type { RouterLocation } from '../../definitions/common';
import type { Combine } from '../../definitions/filters';


export type CombineFunc = (Combine, Object, Object) => Object;

export function merge(combine: Combine, query: Object, other: Object): Object {
  let except = [];

  if (combine) {
    except = combine.except;
  }

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
export function diff(_: Combine, exclude: Object, inspect: Object): Object {
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

function checkFor(checker: Function, query: Object, other: Object) {
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

function getNewUrl(m: CombineFunc, query: Object, combine: ?Combine, location: RouterLocation) {
  return {
    ...location,
    query: combine
      ? m(combine, query, location.query)
      : { ...location.query, ...query }
  };
}

type Props = {
  isDefault?: boolean,
  title: Element<any> | string,
  query: Object,
  location: RouterLocation,
  combine?: Combine,
};

export default function FilterLink({ isDefault, title, query, location, combine }: Props) {
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
