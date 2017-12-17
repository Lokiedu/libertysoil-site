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
*/
import i from 'immutable';
import { omit } from 'lodash';
import { stringify } from 'query-string';

import { river } from '../actions';
import { sortByKeys } from '../utils/lang';
import { extendRiver } from '../utils/river';

const QUERY_PARAMETERS_TO_IGNORE = [
  'limit',
  'offset'
];

function groupedQueryToFlat(query, group) {
  const result = {
    sort: query.group_sort,
    type: query.type
  };

  const { group_by } = query;
  if (group_by === 'first_letter' || group_by === 'starts_with') {
    result.starts_with = group.value;
  }

  return result;
}

export const initialState = i.Map({
  sidebar_tags: i.Map({
    grouped: i.Map(),
    flat: i.Map()
  })
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case river.LOAD_GROUPED_TAG_RIVER: {
      const { query } = action.meta;

      let qs;
      if (action.meta.sorted) {
        qs = stringify(omit(query, QUERY_PARAMETERS_TO_IGNORE));
      } else {
        qs = stringify(sortByKeys(omit(query, QUERY_PARAMETERS_TO_IGNORE)));
      }

      const groups = {
        entries: action.payload.groups.map(group => ({
          ...group,
          entries: group.entries.map(tag => tag.url_name || tag.name)
        })),
        offset: query.offset
      };

      state = state.withMutations(s => {
        s.updateIn(
          ['sidebar_tags', 'grouped', qs],
          river => extendRiver(river, groups)
        );

        for (let group, l = groups.length, i = 0; i < l; ++i) {
          group = groups[i];
          s.updateIn(
            [
              'sidebar_tags',
              'flat',
              stringify(sortByKeys(groupedQueryToFlat(query, group)))
            ],
            river => extendRiver(river, group)
          );
        }
      });

      break;
    }
    case river.LOAD_FLAT_TAG_RIVER: {
      const { query } = action.meta;

      let qs;
      if (action.meta.sorted) {
        qs = stringify(omit(query, QUERY_PARAMETERS_TO_IGNORE));
      } else {
        qs = stringify(sortByKeys(omit(query, QUERY_PARAMETERS_TO_IGNORE)));
      }

      const nextRiver = {
        entries: action.payload.tags.map(tag => tag.url_name || tag.name),
        offset: query.offset
      };

      state = state.updateIn(
        ['sidebar_tags', 'flat', qs],
        river => extendRiver(river, nextRiver)
      );

      break;
    }
  }

  return state;
}
