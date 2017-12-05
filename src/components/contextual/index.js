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
import PropTypes from 'prop-types';

import React from 'react';
import { intersection, omit } from 'lodash';
import { browserHistory, createMemoryHistory } from 'react-router';
import TransitionGroup from 'react-transition-group/TransitionGroup';

import getRoutesFor from '../../selectors/contextual-routes';
import * as Routes from './routes';

const closeRoute = (location) => ({
  ...location,
  query: omit(location.query, ['route'])
});

const onClose = (() => {
  if (browserHistory) {
    return Object.assign(
      () => {
        const location = browserHistory.getCurrentLocation();
        browserHistory.push(closeRoute(location));
      },
      { to: closeRoute }
    );
  }

  return Object.assign(
    () => {
      const history = createMemoryHistory();
      const location = history.getCurrentLocation();
      history.push(closeRoute(location));
    },
    { to: closeRoute }
  );
})();

function getAncestorsPropTypes(component) {
  const result = { ...component.propTypes };

  let c = component;
  while (typeof c.WrappedComponent !== 'undefined') {
    Object.assign(result, c.WrappedComponent.propTypes);
    c = c.WrappedComponent;
  }

  return result;
}

export default class ContextualRoutes extends React.PureComponent {
  static propTypes = {
    location: PropTypes.shape(),
    only: PropTypes.arrayOf(PropTypes.string),
    predefProps: PropTypes.shape(),
    routes: PropTypes.arrayOf(PropTypes.shape()),
    scope: PropTypes.string
  };

  static defaultProps = {
    predefProps: {}
  };

  render() {
    const contextualRoutes = getRoutesFor(this.props)(this.props.scope);

    let allowedRoutes;
    if (this.props.only) {
      allowedRoutes = intersection(this.props.only, contextualRoutes);
    } else {
      allowedRoutes = contextualRoutes;
    }

    const { predefProps } = this.props;
    const renderedRoutes = allowedRoutes.map(routeName => {
      if (!(routeName in Routes)) {
        return false;
      }

      // eslint-disable-next-line import/namespace
      const Route = Routes[routeName];

      const restProps = {};

      const ancestorsPropTypes = getAncestorsPropTypes(Route);
      if ('location' in ancestorsPropTypes) {
        restProps.location = this.props.location;
      }
      if (routeName in predefProps) {
        Object.assign(restProps, predefProps[routeName]);
      }

      return React.createElement(
        Route,
        // eslint-disable-next-line prefer-object-spread/prefer-object-spread
        Object.assign(
          { key: routeName, onClose },
          omit(this.props, KNOWN_PROPS),
          restProps
        )
      );
    });

    return (
      <TransitionGroup>
        {renderedRoutes}
      </TransitionGroup>
    );
  }
}

const KNOWN_PROPS = Object.keys(ContextualRoutes.propTypes);
