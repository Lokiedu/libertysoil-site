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

import { API_HOST } from '../../config';
import ApiClient from '../../api/client';
import { ActionsTrigger } from '../../triggers';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';

import { OldIcon as Icon } from '../icon';
import UserGrid from '../user-grid';
import { ICON_SIZE } from './index';

class WelcomeUserTopMessage extends React.Component {
  static displayName = 'WelcomeUserTopMessage';

  static propTypes = {
    onHomeClick: PropTypes.func,
    onMessageClose: PropTypes.func
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { current_user } = this.props;

    return (
      <div className="top-message layout layout-align_center">
        <div className="top-message__container layout-align_justify">
          <div className="layout">
            <div>
              <Icon
                className="action top-menu__icon"
                icon="home"
                pack="fa"
                size={ICON_SIZE}
                onClick={this.props.onHomeClick}
              />
            </div>
            <div>
              <div className="top-message__body">
                <h3 className="top-message__header">Welcome to LibertySoil, education change network</h3>
                <h3 className="top-message__header">People to follow</h3>
                <UserGrid
                  className="layout__grid-responsive_mobile"
                  current_user={current_user}
                  i_am_following={this.props.following.get(current_user.get('id'))}
                  isResponsive={false}
                  triggers={this.triggers}
                  users={current_user.get('suggested_users')}
                />
              </div>
            </div>
          </div>
          <div>
            <Icon
              className="action"
              icon="close"
              pack="fa"
              size={ICON_SIZE}
              onClick={this.props.onMessageClose}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  currentUserSelector,
  state => state.get('users'),
  state => state.get('following'),
  state => state.get('suggested_users'),
  (current_user, users, following, suggested_users) => ({
    ...current_user,
    users,
    following,
    suggested_users
  })
);

export default connect(mapStateToProps)(WelcomeUserTopMessage);
