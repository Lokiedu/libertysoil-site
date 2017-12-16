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
import noop from 'lodash/noop';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { ActionsTrigger } from '../../triggers';

import SidebarMenu from '../sidebar-menu';
import TagsInform from '../tags-inform';

const isClient = typeof window !== 'undefined';

function isOnTop() {
  return (window.pageYOffset || document.documentElement.scrollTop) === 0;
}

const COLLAPSE_TIMEOUT = 2000;

class SidebarDesktop extends React.PureComponent {
  static className = 'sidebar page__sidebar page__sidebar--side_left page__sidebar--type_main';

  static propTypes = {
    autocollapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    current_user: PropTypes.shape(),
    is_logged_in: PropTypes.bool
  };

  static defaultProps = {
    autocollapsible: true,
    collapsed: undefined
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      collapsed: props.collapsed,
      onTop: isClient ? isOnTop() : true
    };

    this.setScrollListener(true);
    this.setScrollStopListener(props.autocollapsible);
  }

  componentWillReceiveProps(nextProps) {
    this.setScrollStopListener(nextProps.autocollapsible);
    this.setState(state => ({ ...state, collapsed: nextProps.collapsed }));
  }

  componentWillUnmount() {
    this.setScrollListener(false);
  }

  setScrollListener = (() => {
    if (!isClient) {
      return noop;
    }

    return (needListening) => {
      if (needListening === this.isListeningToScroll) {
        return;
      }

      this.isListeningToScroll = needListening;
      if (needListening) {
        window.addEventListener('scroll', this.handleScroll);
        if (!isOnTop()) {
          this.setCollapseTimer(true);
        }
      } else {
        window.removeEventListener('scroll', this.handleScroll);
        this.setCollapseTimer(false);
      }
    };
  })();

  setScrollStopListener = (() => {
    if (!isClient) {
      return noop;
    }

    return (needListening) => {
      if (needListening === this.isAutocollapsible) {
        return;
      }

      this.isAutocollapsible = needListening;
      if (needListening && !isOnTop()) {
        this.setCollapseTimer(true);
      } else {
        this.setCollapseTimer(false);
      }
    };
  })();

  setCollapseTimer = (status) => {
    if (this.collapseTimeout) {
      window.clearTimeout(this.collapseTimeout);
    }

    if (status) {
      this.collapseTimeout = window.setTimeout(
        () => this.setState(state => ({ ...state, collapsed: true })),
        COLLAPSE_TIMEOUT
      );
    } else {
      this.collapseTimeout = null;
    }
  };

  handleScroll = throttle(() => {
    const onTop = isOnTop();
    this.setState(state => ({ ...state, onTop }));

    if (this.isAutocollapsible) {
      if (onTop) {
        this.setCollapseTimer(false);
        this.setState(state => ({ ...state, collapsed: false }));
      } else {
        this.setCollapseTimer(true);
      }
    }
  }, 250);

  handleSwitchClick = () => {
    this.setState(
      state => ({ ...state, collapsed: !state.collapsed }),
      () => {
        const client = new ApiClient(API_HOST);
        const triggers = new ActionsTrigger(client, this.props.dispatch);
        triggers.updateUserInfo(
          { more: { sidebar: { collapsed: this.state.collapsed } } },
          this.props.is_logged_in
        );
      }
    );
  };

  isListeningToScroll = undefined;
  isAutocollapsible = false;
  collapseTimeout = null;

  render() {
    const { current_user } = this.props;
    const { collapsed } = this.state;

    let className = SidebarDesktop.className;
    if (!this.state.onTop) {
      className += ' sidebar--fixed';
    }

    return (
      <div className={className}>
        <div className="sidebar__inner">
          <SidebarMenu
            adaptive
            animated
            truncated={collapsed}
            onSwitchClick={this.handleSwitchClick}
          />
          <TagsInform
            animated
            truncated={collapsed}
            onSwitchClick={this.handleSwitchClick}
          />
        </div>
      </div>
    );
  }
}

function getUserSidebarCollapsing(current_user) {
  if (!current_user.get('user') || !current_user.getIn(['user', 'more'])) {
    return { autocollapsible: true, collapsed: undefined };
  }

  const config = current_user.getIn(['user', 'more', 'sidebar']);
  const collapsed = config && config.get('collapsed');

  return {
    autocollapsible: typeof collapsed === 'undefined',
    collapsed
  };
}

const selector = createSelector(
  currentUserSelector,
  current_user => ({
    ...current_user,
    ...getUserSidebarCollapsing(current_user.current_user)
  })
);

export default connect(selector)(SidebarDesktop);
