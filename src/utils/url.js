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
import isNil from 'lodash/isNil';

export default async function validateUrl(rawUrl = '', allowedHosts = [], routeTree = {}) {
  const url = rawUrl.trim().toLowerCase();
  const withProtocol = hasProtocol(url);

  if (!checkMatchHosts(url, withProtocol)) {
    return false;
  }

  const resourceUrl = getResourceUrl(url, allowedHosts, withProtocol);
  return await checkMatchRoutes(resourceUrl, routeTree);
}

export function hasProtocol(url = '') {
  return !!url.match(/^[a-zA-Z]{1,}:\/\//);
}

export function getResourceUrl(url = '', allowedHosts = [], withProtocol = false) {
  let resourceUrl = url;

  if (withProtocol) {
    for (const host of allowedHosts) {
      if (url.startsWith(host)) {
        resourceUrl = url.replace(host, '');
        break;
      }
    }
  } else if (url[0] !== '/') {
    for (const host of allowedHosts) {
      const h = host.replace(/^https?:\/\//, '');
      if (url.startsWith(h)) {
        resourceUrl = url.replace(h, '');
        break;
      }
    }
  }

  return resourceUrl;
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
