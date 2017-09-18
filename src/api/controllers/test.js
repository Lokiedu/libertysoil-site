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
export async function test(ctx) {
  ctx.body = 'test message in response';
}

export async function testSphinx(ctx) {
  const indexes = await ctx.sphinx.ql.raw(`SHOW TABLES`);
  ctx.body = indexes;
}

export async function testDelete(ctx) {
  ctx.body = 'test message in delete response';
}

export async function testHead(ctx) {
  ctx.body = [];
}

export async function testPost(ctx) {
  ctx.body = 'test message in post response';
}
