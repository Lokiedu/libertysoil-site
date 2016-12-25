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
import { createMemoryHistory } from 'history';
import { createRoutes } from 'react-router';
import matchRoutes from 'react-router/lib/matchRoutes';
import { parse, format } from 'url';
import isNil from 'lodash/isNil';

export default async function validateUrl(rawUrl = '', allowedHosts = [], routeTree = {}) {
  const url = rawUrl.trim().toLowerCase();
  const withProtocol = hasProtocol(url);

  if (!checkMatchHosts(url, withProtocol)) {
    return false;
  }

  const resourceUrl = getResourceUrl(url);
  return await checkMatchRoutes(resourceUrl, routeTree);
}

export function hasProtocol(url = '') {
  return !!url.match(/^[a-zA-Z]{1,}:\/\//);
}

export function getResourceUrl(url = '') {
  const res = parse(url);
  if (res.pathname) {
    const slashes = res.pathname.match(/\//g);
    if (Array.isArray(slashes) && slashes.length > 1 && !res.pathname.endsWith('//')) {
      res.pathname = res.pathname.slice(0, -1);
    }

    return parse(format(res)).path;
  }

  return `/${res.search || ''}`;
}

export function checkMatchHosts(rawUrl = '', allowedHosts = [], withProtocol = false) {
  const url = rawUrl.trim().toLowerCase();

  if (withProtocol) {
    if (allowedHosts.every(a => !url.startsWith(a))) {
      return false;
    }
  } else {
    const allowedCut = allowedHosts.concat(['/']);
    if (allowedCut.every(a => !url.startsWith(a.replace(/^https?:\/\//, '')))) {
      return false;
    }
  }

  return true;
}

export async function checkMatchRoutes(resourceUrl = '', routeTree = {}) {
  const createLocation = createMemoryHistory().createLocation;
  const routes = createRoutes(routeTree);

  let matches = false;
  await matchRoutes(routes, createLocation(resourceUrl), (error, match) => {
    if (!isNil(match)) {
      matches = true;
    }
  });

  return matches;
}
