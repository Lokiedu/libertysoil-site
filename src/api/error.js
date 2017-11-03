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
/**
 * General purpose error handler. Use for processing errors used across many controllers.
 * ```
 * {
 *   fields: [{ message, path, type, context }], // Only for validation errors. See https://github.com/hapijs/joi/blob/v10.6.0/API.md#errors
 *   error: 'some.error.code'
 * }
 * ```
 * @param ctx Koa context
 * @param {Error} e
 */
export function processError(ctx, e) {
  if (e.isJoi) {
    ctx.status = 400;
    ctx.body = {
      fields: e.details,
      error: 'api.errors.validation'
    };
  } else if (
    e instanceof ctx.bookshelf.NotFoundError ||
    e instanceof ctx.bookshelf.Collection.EmptyError ||
    e instanceof ctx.bookshelf.NoRowsUpdatedError ||
    e instanceof ctx.bookshelf.NoRowsDeletedError
  ) {
    ctx.status = 404;
    ctx.body = {
      error: 'api.errors.not-found'
    };
  } else {
    ctx.status = 500;
    ctx.body = {
      error: 'api.errors.internal.short'
    };
  }
}
