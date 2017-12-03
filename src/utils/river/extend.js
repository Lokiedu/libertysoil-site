/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { fromJS, List, Map } from 'immutable';
import { isEqual } from 'lodash';

type River<T> = {
  entries: Array<T>,
  offset: number
};

type Options<T> = {
  compare?: (a: any, b: T) => boolean,
  strict?: boolean
};

type Errors = {
  nextRiver: boolean,
  river: boolean
};

function validate<T>(river: Map, nextRiver: River<T>): Errors {
  return {
    nextRiver:
      typeof nextRiver !== 'object' || nextRiver === null ||
      typeof nextRiver.offset !== 'number' ||
      !Array.isArray(nextRiver.entries),
    river:
      !Map.isMap(river) ||
      typeof river.get('offset') !== 'number' ||
      !List.isList(river.get('entries'))
  };
}

const defaultOptions: Options<T> = {
  compare: isEqual,
  strict: false
};

function getOptions<T>(options?: ?Options<T>): Options<T> {
  return { ...defaultOptions, ...options };
}

export default function extendRiver<T>(
  river: Map,
  nextRiver: River<T>,
  options?: ?Options<T>,
): Map {
  const errors = validate(river, nextRiver);

  if (errors.river) {
    if (errors.nextRiver) {
      return undefined;
    }

    return fromJS(nextRiver);
  }

  if (errors.nextRiver) {
    if (errors.river) {
      return undefined;
    }

    return river;
  }

  const prevOffset  = river.get('offset');
  const prevEntries = river.get('entries');
  const nextOffset  = nextRiver.offset;
  const nextEntries = nextRiver.entries;

  const opts = getOptions(options);

  if (nextOffset <= prevOffset) {
    if (nextOffset + nextEntries.length === prevOffset) {
      return river.withMutations((r: Map) => {
        r.set('entries', fromJS(nextEntries).concat(prevEntries));
        r.set('offset', nextOffset);
      });
    }

    if (nextOffset + nextEntries.length < prevOffset) {
      // empty space between river parts is not allowed
      return fromJS(nextRiver);
    }

    const firstItem = prevEntries.first();
    const sameItemIndex = nextEntries.findIndex(
      (item: T) => opts.compare(firstItem, item)
    );

    if (sameItemIndex < 0) {
      return fromJS(nextRiver);
    }

    if (sameItemIndex === 0) {
      // nextEntries may be bigger: extend the river
      // if it isn't, it's OK too: `List#push.apply(es, []) === List`
      return river.set('entries', prevEntries.concat(
        fromJS(nextEntries.slice(prevEntries.size))
      ));
    }

    return river.withMutations((r: Map) => {
      r.update('entries', (es: List) =>
        fromJS(nextEntries.slice(0, sameItemIndex))
          .concat(es)
          .concat(fromJS(nextEntries.slice(sameItemIndex + es.size)))
      );
      r.set('offset', nextOffset);
    });
  }

  const lastItemOffset = prevOffset + prevEntries.size - 1;

  if (nextOffset <= lastItemOffset) {
    const intersectionIndex = nextOffset - prevOffset;

    if (prevEntries.get(intersectionIndex) === nextEntries[0]) {
      return river.set('entries', prevEntries
        .concat(fromJS(
          nextEntries.slice(prevEntries.size - intersectionIndex)
        ))
      );
    }

    return fromJS(nextRiver);
  }

  if (nextOffset - lastItemOffset === 1) {
    return river.set('entries', prevEntries.concat(fromJS(nextEntries)));
  }

  return fromJS(nextRiver);
}
