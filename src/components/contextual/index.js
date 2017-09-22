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
import Login from './wrappers/login';
import Register from './wrappers/register';

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

const pobj = {};

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
      let restProps;
      if (routeName in predefProps) {
        restProps = predefProps[routeName];
      } else {
        restProps = pobj;
      }

      switch (routeName) {
        case 'login': {
          return (
            <Login
              key="login"
              onClose={onClose}
              {...omit(this.props, KNOWN_PROPS)}
              {...restProps}
            />
          );
        }
        case 'signup': {
          return (
            <Register
              key="signup"
              onClose={onClose}
              {...omit(this.props, KNOWN_PROPS)}
              {...restProps}
            />
          );
        }
        default: {
          return false;
        }
      }
    });

    return (
      <TransitionGroup>
        {renderedRoutes}
      </TransitionGroup>
    );
  }
}

const KNOWN_PROPS = Object.keys(ContextualRoutes.propTypes);
