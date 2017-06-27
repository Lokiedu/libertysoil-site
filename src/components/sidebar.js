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
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';

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
    isCollapsing: PropTypes.bool,
    isDesktopEnabled: PropTypes.bool,
    isEmpty: PropTypes.bool,
    isMobileMenuOn: PropTypes.bool,
    isTruncated: PropTypes.bool,
    // theme: PropTypes.string
  };

  static defaultProps = {
    isCollapsing: true,
    isDesktopEnabled: true,
    isMobileMenuOn: false,
    isTruncated: false
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isMobile: true,
      isOnTop: undefined
    };

    if (typeof window !== 'undefined' && window.matchMedia) {
      const nonMobileQuery = window.matchMedia('(min-width: 768px)');
      nonMobileQuery.addListener(this.handleViewChange);

      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.isMobile = !nonMobileQuery.matches;

      if (props.isCollapsing && nonMobileQuery.matches) {
        this.toggleScrollListener(true);

        const offset = window.pageYOffset || document.documentElement.scrollTop;
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state.isOnTop = offset === 0;
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCollapsing !== this.props.isCollapsing) {
      this.toggleScrollListener(nextProps.isCollapsing);

      if (nextProps.isCollapsing) {
        this.handleScroll();
        this.handleScroll.flush();
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || !isEqual(nextState, this.state);
  }

  componentWillUnmount() {
    window.matchMedia('(min-width: 768px)')
      .removeListener(this.handleViewChange);
    this.toggleScrollListener(false);
  }

  handleViewChange = (nonMobileQuery) => {
    if (nonMobileQuery.matches) {
      this.toggleScrollListener(true);
      this.setState({ isMobile: false });
    } else {
      this.toggleScrollListener(false);
      this.setState({ isMobile: true });
    }
  };

  isScrollListened = false;

  toggleScrollListener = (nextState = !this.isScrollListened) => {
    if (nextState) {
      if (!this.isScrollListened) {
        window.addEventListener('scroll', this.handleScroll);
      }
    } else if (this.isScrollListened) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.isScrollListened = nextState;
  };

  handleScroll = throttle(() => {
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    const isOnTop = offset === 0;
    if (isOnTop !== this.state.isOnTop) {
      this.setState({ isOnTop });
    }
  }, 250);

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

    const { isMobile } = this.state;
    const displayMobileMenu =
      this.props.isMobileMenuOn && isMobile;
    if (displayMobileMenu) {
      return (
        <div className={defaultClassName.concat(' mobile-menu')} onClick={this.handleClose}>
          <div className="mobile-menu__section" onClick={this.handleClickInside}>
            <SidebarMenu current_user={this.props.current_user} />
            <TagsInform current_user={this.props.current_user} />
          </div>
        </div>
      );
    }

    if (!this.props.isDesktopEnabled) {
      return null;
    }

    const { isCollapsing } = this.props;
    const isTruncated = this.props.isTruncated
      || (isCollapsing && !this.state.isOnTop);

    let className = defaultClassName;
    if (isTruncated) {
      className += ' sidebar--truncated';
    }

    return (
      <div className={className}>
        <div className="sidebar__inner">
          <SidebarMenu
            animated={isCollapsing && !isMobile}
            current_user={this.props.current_user}
            truncated={isTruncated}
          />
          <TagsInform
            animated={isCollapsing && !isMobile}
            current_user={this.props.current_user}
            truncated={isTruncated}
          />
        </div>
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
