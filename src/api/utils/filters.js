/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import { isEmpty, isString, uniq, intersection } from 'lodash';


/*
  Function signature convention:
  applySomeQuery(qb, query, options)
*/

/**
 * Sets 'order by' for the {@link qb} depending on the 'sort' query parameter.
 * Syntax: `?sort=column1,-column2,column3`
 * @param qb Knex query builder.
 * @param {Object} query An object containing query parameters.
 */
export function applySortQuery(qb, query, options = {}) {
  if ('sort' in query || options.defaultValue) {
    const columns = (query.sort || options.defaultValue).split(',');

    const queryString = columns.map(column => {
      let order = 'ASC';

      if (column[0] == '-') {
        column = column.substring(1);
        order = 'DESC';
      }

      return `${column} ${order}`;
    }).join(', ');

    qb.orderByRaw(queryString);
  }
}

export function applyStartsWithQuery(qb, query) {
  if ('startsWith' in query) {
    qb.where('name', 'ILIKE', `${query.startsWith}%`);
  }
}

export function applyLimitQuery(qb, query, options = {}) {
  if ('limit' in query || options.defaultValue) {
    qb.limit(query.limit || options.defaultValue);
  }
}

export function applyOffsetQuery(qb, query, options = {}) {
  if ('offset' in query || options.defaultValue) {
    qb.offset(query.offset || options.defaultValue);
  }
}

/**
 * Syntax:
 *   ?fields=id,name
 *   ?fields=+id,name - to extend default
 */
export function applyFieldsQuery(qb, query, { allowedFields, defaultFields, table = null }) {
  let fields = defaultFields;
  if (!isEmpty(query.fields)) {
    fields = query.fields.split(',');

    if (query.fields[0] == '+' && defaultFields) {
      fields = uniq(fields.concat(defaultFields));
    }

    fields = intersection(fields, allowedFields);
  }

  if (fields && table) {
    fields = fields.map(col => `${table}.${col}`);
  }

  if (fields) {
    qb.select(fields);
  }
}

export function applyDateRangeQuery(qb, query, options) {
  const { field, paramName } = {
    paramName: 'dateRange',
    ...options,
  };

  if (!isString(query[paramName])) {
    return;
  }

  const [lhs, rhs] = query[paramName]
    .split('..')
    .map(date => new Date(date));

  if (!isNaN(lhs.getTime())) {
    qb.where(field, '<=', lhs);
  }

  if (!isNaN(rhs.getTime())) {
    qb.where(field, '>=', rhs);
  }
}
