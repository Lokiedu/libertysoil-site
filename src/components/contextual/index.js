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
import { connect } from 'react-redux';
import omit from 'lodash/omit';
import { browserHistory, createMemoryHistory } from 'react-router';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import createSelector from '../../selectors/createSelector';

const onClose = (() => {
  if (browserHistory) {
    return () => browserHistory.push({
      ...browserHistory.getCurrentLocation(),
      hash: ''
    });
  }

  return () => {
    const history = createMemoryHistory();
    history.push({ ...history.getCurrentLocation(), hash: '' });
  };
})();

const pobj = {};

class ContextualRoutes extends React.Component {
  static propTypes = {
    hash: PropTypes.string,
    only: PropTypes.arrayOf(PropTypes.string),
    predefProps: PropTypes.shape(),
    routes: PropTypes.shape(),
    scope: PropTypes.string
  };

  static defaultProps = {
    predefProps: {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { hash, only, predefProps } = this.props;

    let restProps = pobj;
    if (hash) {
      const routeHandler = this.props.routes.get(hash);
      if (routeHandler !== this.props.scope) {
        return false;
      }

      if (only && !only.includes(hash)) {
        return false;
      }

      if (hash in predefProps) {
        restProps = predefProps[hash];
      }
    }

    let component;

    switch (hash) {}

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

const mapStateToProps = createSelector(
  state => state.getIn(['ui', 'contextual', 'routes']),
  routes => ({ routes: routes.map((scope) => scope.last()) })
);

export default connect(mapStateToProps)(ContextualRoutes);
