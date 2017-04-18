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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';
import currentUserSelector from '../selectors/currentUser';
import { toggleMenu } from '../actions/ui';

import SidebarMenu from './sidebar-menu';
import TagsInform from './tags-inform';

/*
  function getClassName(theme) {
    const finalize = s =>
      `sidebar col col-xs col-${s} col-s-${s} col-m-${s} col-l-${s} col-xl-${s}`;

    switch (theme) {
      case 'trunc': return finalize(1);
      case 'min': return finalize(2);
      case 'ext': return finalize(6);
      default: return finalize(4);
    }
  }
*/

const defaultClassName = [
  'sidebar',
  'page__sidebar',
  'page__sidebar--side_left',
  'page__sidebar--type_main'
].join(' ');

class Sidebar extends React.Component {
  static propTypes = {
    isDesktopEnabled: PropTypes.bool,
    isEmpty: PropTypes.bool,
    isMobileMenuOn: PropTypes.bool
    // theme: PropTypes.string
  };

  static defaultProps = {
    isDesktopEnabled: true,
    isMobileMenuOn: false
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isMobile: true
    };
  }

  componentDidMount() {
    window.matchMedia('(min-width: 768px)')
      .addListener(this.handleViewChange);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props ||
      nextState.isMobile !== this.state.isMobile;
  }

  componentWillUnmount() {
    window.matchMedia('(min-width: 768px)')
      .removeListener(this.handleViewChange);
  }

  handleViewChange = (nonMobileQuery) => {
    if (nonMobileQuery.matches) {
      this.setState({ isMobile: false });
    } else {
      this.setState({ isMobile: true });
    }
  };

  handleClose = () => {
    this.props.dispatch(toggleMenu(false));
  };

  handleClickInside = (event) => {
    event.stopPropagation();
  };

  render() {
    if (this.props.isEmpty) {
      return <div className="sidebar page__sidebar" />;
    }

    const sidebarBody = [
      <SidebarMenu current_user={this.props.current_user} key="menu" />,
      <TagsInform current_user={this.props.current_user} key="tags" />
    ];

    const displayMobileMenu =
      this.props.isMobileMenuOn && this.state.isMobile;
    if (displayMobileMenu) {
      return (
        <div className={defaultClassName.concat(' mobile-menu')} onClick={this.handleClose}>
          <div className="mobile-menu__section" onClick={this.handleClickInside}>
            {sidebarBody}
          </div>
        </div>
      );
    }

    if (!this.props.isDesktopEnabled) {
      return null;
    }

    return (
      <div className={defaultClassName}>
        {sidebarBody}
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.getIn(['ui', 'mobileMenuIsVisible']),
  (current_user, isMobileMenuOn) => ({
    isMobileMenuOn,
    ...current_user
  })
);

export default connect(selector)(Sidebar);
