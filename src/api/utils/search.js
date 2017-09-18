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
export async function addToSearchIndex(sphinx, index, data) {
  const rt_index_name = `${index}sRT`;
  const next_index_meta = await sphinx.ql.raw(`SHOW INDEX ${rt_index_name} STATUS`);

  const next_id = ++next_index_meta[0][1]['Value'];

  data.uuid = data.id;
  data.id = next_id;
  data.type = index;

  return await sphinx.ql.insert(data).into(rt_index_name);
}

export async function updateInSearchIndex(bookshelf, sphinx, index, data) {
  const rt_index_name = `${index}sRT`;
  const Model = bookshelf.model(index);
  const user = await Model.where({ id: data.id }).fetch({ require: true });

  const id = user.get('_sphinx_id');

  data.uuid = data.id;
  data.id = id;
  data.type = index;

  const q = sphinx.ql.insert(data).into(rt_index_name).toString();

  return await sphinx.ql.raw(q.replace(/insert into/i, 'replace into'));
}
