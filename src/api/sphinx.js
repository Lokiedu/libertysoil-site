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
import SphinxClient from 'sphinxapi';
import knex from 'knex';


export default function initSphinx() {
  const client = new SphinxClient();

  client.SetServer(
    process.env.SPHINX_PORT_9312_TCP_ADDR || '127.0.0.1',
    parseInt(process.env.SPHINX_PORT_9312_TCP_PORT, 10) || 9312
  );

  return {
    api: client,
    ql: knex({
      client: 'mysql2',
      connection: {
        host: process.env.SPHINX_PORT_9306_TCP_ADDR || '127.0.0.1',
        port: process.env.SPHINX_PORT_9306_TCP_PORT || 9306
      }
    })
  };
}
