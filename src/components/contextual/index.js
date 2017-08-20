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
import React, { PropTypes } from 'react';
import omit from 'lodash/omit';
import { browserHistory, createMemoryHistory } from 'react-router';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import getRouteFor from '../../selectors/contextual-routes';
import Login from './wrappers/login';
import Register from './wrappers/register';

const onClose = (() => {
  if (browserHistory) {
    return () => {
      const location = browserHistory.getCurrentLocation();

      browserHistory.push({
        ...location,
        query: omit(location.query, ['route'])
      });
    };
  }

  return () => {
    const history = createMemoryHistory();
    const location = history.getCurrentLocation();
    history.push({
      ...location,
      query: omit(location.query, ['route'])
    });
  };
})();

const pobj = {};

export default class ContextualRoutes extends React.Component {
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

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const routeName = getRouteFor(this.props)(this.props.scope);

    let restProps = pobj;

    if (routeName) {
      const { only } = this.props;
      if (only && !only.includes(routeName)) {
        return false;
      }

      const { predefProps } = this.props;

      if (routeName in predefProps) {
        restProps = predefProps[routeName];
      }
    }

    let component;

    switch (routeName) {
      case 'login': {
        component = (
          <Login
            key="login"
            onClose={onClose}
            {...omit(this.props, KNOWN_PROPS)}
            {...restProps}
          />
        );

        break;
      }
      case 'signup': {
        component = (
          <Register
            key="signup"
            onClose={onClose}
            {...omit(this.props, KNOWN_PROPS)}
            {...restProps}
          />
        );

        break;
      }
    }

    return (
      <CSSTransitionGroup
        component="div"
        transitionName="sidebar-modal__overlay--transition"
        transitionAppear={false}
        transitionEnter={false}
        transitionLeave
        transitionLeaveTimeout={250}
      >
        {component}
      </CSSTransitionGroup>
    );
  }
}

const KNOWN_PROPS = Object.keys(ContextualRoutes.propTypes);
