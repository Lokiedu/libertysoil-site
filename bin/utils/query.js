import _ from 'lodash';
import knex from './knex';


/**
 * Executes queries in batches.
 * @param {Array} queries - array of sql queries
 * @param {number} batchSize
 * @returns {Promise}
 */
async function executeQueries(queries, batchSize = 1000) {
  for (const batch of _.chunk(queries, batchSize)) {
    await knex.raw(batch.join('\n'));
  }
}

/**
 * @param {Array} values - ['1', 2, 3, 'val']
 * @returns {Knex.Raw} - "'1', 2, 3, 'val'"
 */
export function formatValues(values) {
  return knex.raw(
    _.times(values.length, _.constant('?')).join(', '),
    values
  );
}

/**
 * Returns a query which updates or inserts a row if it doesn't exist.
 * The target table MUST not be empty, otherwise it wont insert anything.
 * @param {string} table
 * @param {object} condition
 * @param {object} attributes
 * @returns {string} - sql query string
 */
export function getUpsertQuery(table, condition, attributes) {
  const updateQuery = knex(table)
    .where(condition)
    .update(attributes)
    .toString();

  const columnNames = Object.keys(attributes);

  const selectQuery = knex
    .select(formatValues(columnNames.map(name => attributes[name]))) // 'val1', 'val2', 3, ...
    .whereNotExists(function () {
      this.select(1).from(table).where(condition);
    })
    .toSQL();

  // insertQuery                         selectQuery
  // v                                   v
  // INSERT INTO table (col1, col2, ...) SELECT val1, val2, ... WHERE NOT EXISTS (SELECT 1 FROM table WHERE condition)
  const insertQuery = knex(table)
    .insert(
      knex.raw(`(${columnNames.join(', ')}) ${selectQuery.sql}`, selectQuery.bindings)
    )
    .toString();

  return cleanUpExtraEscapes(`${updateQuery}; ${insertQuery};`);
}


/**
 * Takes in attributes, creates queries and executes them in batches.
 * @param {string} table - the table name
 * @param {Array} attributes - an array of attribute objects
 * @param {function} conditionExtractor - attrs => {key: attrs.key}
 * @returns {Promise}
 */
export async function bulkUpsert(table, attributes, conditionExtractor) {
  const tableEmpty = (await knex(table).count())[0].count == 0;

  let queries;

  if (tableEmpty) {
    // No need to update, only insert.
    queries = attributes.map(recordAttributes => {
      return cleanUpExtraEscapes(`${knex(table).insert(recordAttributes).toString()};`);
    });
  } else {
    queries = attributes.map(recordAttributes => {
      const condition = conditionExtractor(recordAttributes);
      return getUpsertQuery(table, condition, recordAttributes);
    });
  }

  return executeQueries(queries);
}

/**
 * Cleans up extra `\` from the string.
 * Fixes cases where knex escapes double quotes that don't need to be escaped (e.g. when using JSON.stringify).
 * Example: \\"test\\" => \"test\"
 * @param {string} str
 * @returns {string}
 */
export function cleanUpExtraEscapes(str) {
  if (knex.VERSION !== '0.10.0') {
    throw new Error(`The code uses string-escaping hack to avoid error in Knex's code. It is not tested with your version of Knex`);
  }

  return str.replace(/\\\\"/g, '\\"');
}
