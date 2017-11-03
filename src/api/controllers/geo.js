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
import { format as format_url, parse as parse_url } from 'url';
import fetch from 'node-fetch';

import config from '../../../config';

export async function getCountry(ctx) {
  const Country = ctx.bookshelf.model('Country');

  const country = await Country.where({ iso_alpha2: ctx.params.code })
    .fetch({ require: true });

  ctx.body = country;
}

export async function getCity(ctx) {
  const City = ctx.bookshelf.model('City');

  const city = await City.where({ id: ctx.params.id })
    .fetch({ require: true });

  ctx.body = city;
}

export async function pickpoint(ctx) {
  const urlObj = parse_url(`https://pickpoint.io/api/v1/forward`);
  urlObj.query = { ...ctx.query, key: config.pickpoint.key };

  const response = await fetch(format_url(urlObj));
  const data = await response.json();

  ctx.body = data;
}
