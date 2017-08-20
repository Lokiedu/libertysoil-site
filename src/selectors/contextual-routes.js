/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { getRouteName } from '../utils/router';
import createSelector from './createSelector';

const getContextualRoutes = (route) => {
  const component = route.component;
  if (!component || !component.displayName) {
    return undefined;
  }

  if (component.displayName.startsWith('Connect')) {
    const wrapped = component.WrappedComponent;
    return wrapped.contextualRoutes;
  }

  return component.contextualRoutes;
};

const getRoutesMap = (wholeScope) => {
  const map = {};

  for (const scope of wholeScope) {
    const contextualRoutes = getContextualRoutes(scope);
    if (contextualRoutes) {
      const scopeName = getRouteName(scope);
      for (const routeName of contextualRoutes) {
        map[routeName] = scopeName;
      }
    }
  }

  return map;
};

export default createSelector(
  props => props.location.query.route,
  props => props.routes,
  (routeName, wholeScope) =>
    scopeName => {
      const currentRouteScopeName = getRoutesMap(wholeScope)[routeName];
      if (currentRouteScopeName && currentRouteScopeName === scopeName) {
        return routeName;
      }

      return undefined;
    }
);
