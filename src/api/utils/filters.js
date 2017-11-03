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
import _ from 'lodash';

/**
 * Sets 'order by' for the {@link qb} depending on the 'sort' query parameter.
 * Syntax: `?sort=column1,-column2,column3`
 * @param qb Knex query builder.
 * @param {Object} query An object containing query parameters.
 */
export async function applySortQuery(qb, query, defaultValue = null) {
  if ('sort' in query || defaultValue) {
    const columns = (query.sort || defaultValue).split(',');

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

export async function applyStartsWithQuery(qb, query) {
  if ('startsWith' in query) {
    qb.where('name', 'ILIKE', `${query.startsWith}%`);
  }
}

export async function applyLimitQuery(qb, query, defaultValue = null) {
  if ('limit' in query || defaultValue) {
    qb.limit(query.limit || defaultValue);
  }
}

export async function applyOffsetQuery(qb, query, defaultValue = null) {
  if ('offset' in query || defaultValue) {
    qb.offset(query.offset || defaultValue);
  }
}

/**
 * Syntax:
 *   ?fields=id,name
 *   ?fields=+id,name - to extend default
 */
export async function applyFieldsQuery(qb, query, allowedFields, defaultFields = null, table = null) {
  let fields = defaultFields;
  if (!_.isEmpty(query.fields)) {
    fields = query.fields.split(',');

    if (query.fields[0] == '+' && defaultFields) {
      fields = _.uniq(fields.concat(defaultFields));
    }

    fields = _.intersection(fields, allowedFields);
  }

  if (table) {
    fields = fields.map(col => `${table}.${col}`);
  }

  if (fields) {
    qb.select(fields);
  }
}
