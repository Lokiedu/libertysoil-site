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
// @flow
import { fromPairs, isPlainObject, reduce, sortBy } from 'lodash';

export function toSpreadArray(obj: Object): Array<Object> {
  return reduce(obj, (arr: Array<Object>, value: any, key: string): Array<Object> => {
    arr.push({ [key]: value });
    return arr;
  }, []);
}

export function castArray(value: any): Array<any> {
  if (typeof value === 'undefined') {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

export function castObject(value: any, fieldName: string): Object {
  if (isPlainObject(value)) {
    return value;
  }

  return { [fieldName]: value };
}

export function removeWhitespace(str: string = ''): string {
  return str
    .trim()               // whitespace from ends
    .split(' ')
    .filter((word: ?string) => word) // extra whitespace between words
    .join(' ');
}

/* eslint-disable no-var */
function arguments2Array(args: arguments): Array<mixed> {
  var l = args.length, array = Array(l);
  for (var i = 0; i < l; ++i) {
    array[i] = args[i];
  }
  return array;
}
/* eslint-enable */

type SeqCompose = (acc: mixed, i: number, args: Array<mixed>) => Array<mixed>;

const iterate = (
  transformers: Array<() => mixed>,
  i: number,
  acc: mixed,
  args: Array<mixed>,
  compose: SeqCompose,
  ctx: mixed
): mixed => {
  if (i >= transformers.length) {
    return acc;
  }

  acc = transformers[i].apply(ctx, compose(acc, i, args));
  if (acc && typeof acc.then === 'function') {
    return acc.then((val: mixed): mixed => {
      acc = val;
      return iterate(transformers, i + 1, acc, args, compose, ctx);
    });
  }

  return iterate(transformers, i + 1, acc, args, compose, ctx);
};

const defaultSeqCompose: SeqCompose = (
  acc: mixed,
  i: number,
  args: Array<mixed>
): Array<mixed> => {
  if (!i) {
    return args;
  }
  return [acc].concat(args.slice(1));
};

/**
 * Provides a mapper executing attached transformers sequentially
 * (with the order they are specified in the `transformers` array parameter).
 *
 * Synchronous by default. Becomes asynchronous when one of the transformers
 * returns a promise. Awaits the promise before executing the following transformers.
 *
 * @param {Array<() => *>} transformers Array of transformers
 * @param {SeqCompose} compose Function intended to set the arguments of each transformer.
 * @param {*} ctx Context to execute transformers with.
 * @returns {() => *} Mapper executing attached transformers sequentially.
 */
export function seq(
  transformers: Array<() => mixed>,
  compose: SeqCompose = defaultSeqCompose,
  ctx: mixed = null
): () => mixed {
  if (!transformers || !transformers.length) {
    throw new Error('seq: no transformers given');
  }

  return function (): mixed {
    return iterate(transformers, 0, undefined, arguments2Array(arguments), compose, ctx);
  };
}

/* eslint-disable no-var */
/**
 * Provides a synchronous mapper executing attached transformers sequentially
 * (with the order they are specified in the `transformers` array parameter).
 *
 * @param {Array<() => *>} transformers Array of transformers
 * @param {SeqCompose} compose Function intended to set the arguments of each transformer.
 * @param {*} ctx Context to execute transformers with.
 * @returns {() => *} Mapper executing attached transformers sequentially.
 */
seq.sync = function seqSync(
  transformers: Array<() => mixed>,
  compose: SeqCompose = defaultSeqCompose,
  ctx: mixed = null
): () => mixed {
  if (!transformers || !transformers.length) {
    throw new Error('seqSync: no transformers given');
  }

  return function (): mixed {
    var acc = undefined;
    for (var i = 0, l = transformers.length; i < l; ++i) {
      var t = transformers[i];
      acc = t.apply(ctx, compose(acc, i, arguments2Array(arguments)));
    }
    return acc;
  };
};
/* eslint-enable */

/* eslint-disable no-var */
/**
 * Provides an asynchonous mapper executing attached transformers sequentially
 * (with the order they are specified in the `transformers` array parameter).
 *
 * @param {Array<() => *>} transformers Array of transformers.
 * @param {SeqCompose} compose Function intended to set the arguments of each transformer.
 * @param {*} ctx Context to execute transformers with.
 * @returns {() => Promise<*>} Mapper executing attached transformers sequentially.
 */
seq.async = function seqAsync(
  transformers: Array<() => mixed>,
  compose: SeqCompose = defaultSeqCompose,
  ctx: mixed = null
): () => Promise<mixed> {
  if (!transformers || !transformers.length) {
    throw new Error('seqAsync: no transformers given');
  }

  /**
   * Mapper executing attached transformers in parallel.
   * @returns {Promise<*>} Combined result of attached transformers' execution
   */
  return async function (): Promise<mixed> {
    var acc = undefined;
    for (var i = 0, l = transformers.length; i < l; ++i) {
      var t = transformers[i];
      acc = await t.apply(ctx, compose(acc, i, arguments2Array(arguments)));
    }
    return acc;
  };
};
/* eslint-enable no-var */

type ParCompose = (i: number, args: Array<mixed>) => Array<mixed>;

/*
  $FlowIssue: there's no built-in type for `arguments` object in flow
  flow infers `arguments` as `any` (`type-at-pos` command).
  https://github.com/facebook/flow/issues/4672
  */
const defaultParCompose: ParCompose = (i: number, args: $FlowIssue) => args;

/**
 * Provides a mapper executing attached transformers in parallel.
 *
 * Calls `combine` to form the final result. If `combine` isn't present,
 * returns an array of intermediate results (transformers' returning values
 * in the order they are specified in the `transformers` array parameter).
 * 
 * Usage example:
 * ```
 * Promise.all(
 *   posts.map(
 *     par(
 *       [fetchComments, fetchTags, fetchUserReactions.bind(userId)],
 *       ([comments, tags, reactions]) => ({ comments, tags, reactions })
 *     )
 *   )
 * )
 * ```
 * @param {Array<() => *>} transformers Array of transformers.
 * @param {?(() => *)} combine Function intended to form the final transformed value from intermediate transformations.
 * @param {ParCompose} compose Function intended to set the arguments of each transformer.
 * @param {*} ctx Context to execute transformers with.
 * @returns {() => Promise<*>} Mapper executing attached transformers in parallel.
 */
export function par(
  transformers: Array<() => mixed>,
  combine: ?(() => mixed) = null,
  compose: ParCompose = defaultParCompose,
  ctx: mixed = null
): () => Promise<mixed> {
  if (!transformers || !transformers.length) {
    throw new Error('par: no transformers given');
  }

  /**
   * Mapper executing attached transformers in parallel
   * @returns {Promise<*>} Combined result of attached transformers' execution
   */
  return function (): Promise<mixed> {
    const result = Promise.all(
      transformers.map(
        (t: () => mixed, i: number) => t.apply(ctx, compose(i, arguments))
      )
    );

    if (typeof combine !== 'function') {
      return result;
    }

    return result.then(combine);
  };
}

export function sortByKeys(object: object): object {
  const keys = Object.keys(object);
  const sortedKeys = sortBy(keys);

  return fromPairs(
    sortedKeys.map((key: string) => [key, object[key]])
  );
}
