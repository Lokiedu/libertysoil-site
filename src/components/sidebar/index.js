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
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { toggleMenu } from '../../actions/ui';
import createSelector from '../../selectors/createSelector';
import SidebarDesktop from './desktop';
import SidebarMobile from './mobile';

class Sidebar extends React.PureComponent {
  static propTypes = {
    desktopOn: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    mobileOn: PropTypes.bool
  };

  static propKeys = Object.keys(Sidebar.propTypes);

  static defaultProps = {
    desktopOn: true,
    mobileOn: true
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      mobile: true
    };

    if (typeof window === 'object' && window && window.matchMedia) {
      const nonMobileQuery = window.matchMedia('(min-width: 768px)');
      nonMobileQuery.addListener(this.handleViewChange);
      this.state.mobile = !nonMobileQuery.matches;
    }
  }

  componentWillUnmount() {
    window
      .matchMedia('(min-width: 768px)')
      .removeListener(this.handleViewChange);
  }

  handleMobileClose = () => {
    this.props.dispatch(toggleMenu(false));
  };

  handleViewChange = (nonMobileQuery) => {
    this.setState(state => ({
      ...state, mobile: !nonMobileQuery.matches
    }));
  };

  render() {
    if (this.props.mobileOn && this.state.mobile) {
      return (
        <SidebarMobile
          onClose={this.handleMobileClose}
          {...omit(this.props, Sidebar.propKeys)}
        />
      );
    }

    if (!this.props.desktopOn) {
      return null;
    }

    return <SidebarDesktop {...omit(this.props, Sidebar.propKeys)} />;
  }
}

const selector = createSelector(
  state => state.getIn(['ui', 'mobileMenuIsVisible']),
  mobileOn => ({ mobileOn })
);

export default connect(selector)(Sidebar);
