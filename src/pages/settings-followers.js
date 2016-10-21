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
import Helmet from 'react-helmet';
import { List } from 'immutable';

import {
  mapOf as mapOfPropType,
  uuid4 as uuid4PropType
} from '../prop-types/common';
import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import BaseSettingsPage from './base/settings';
import UserGrid from '../components/user-grid';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

class SettingsFollowersPage extends React.Component {
  static displayName = 'SettingsPasswordPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    followers: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    following: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    i_am_following: ArrayOfUsersIdPropType,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const props = store.getState();
    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    const currentUser = props.get('users').get(currentUserId);

    const userInfo = client.userInfo(currentUser.get('username'));
    store.dispatch(addUser(await userInfo));
  }

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      followers,
      users
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    const i_am_following = following.get(current_user.get('id'));

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const followingUsers = (following.get(current_user.get('id')) || List())
      .map(userId => users.get(userId));
    const followersUsers = (followers.get(current_user.get('id')) || List())
      .map(userId => users.get(userId));

    return (
      <BaseSettingsPage
        current_user={current_user}
        followers={followers}
        following={following}
        is_logged_in={is_logged_in}
        messages={messages}
        triggers={triggers}
      >
        <Helmet title="Manage Followers on " />
        <div className="paper__page">
          <h1 className="content__title">Manage Followers</h1>
        </div>

        <div className="paper__page">
          <h2 className="content__sub_title layout__row">People you follow</h2>
          <div className="layout__row layout__row-double">
            <UserGrid
              current_user={current_user}
              i_am_following={i_am_following}
              notFoundMessage="You are not following any users"
              triggers={triggers}
              users={followingUsers}
            />
          </div>
        </div>

        <div className="paper__page">
          <h2 className="content__sub_title layout__row">Following you</h2>
          <div className="layout__row layout__row-double">
            <UserGrid
              current_user={current_user}
              i_am_following={i_am_following}
              notFoundMessage="No one follows you yet"
              triggers={triggers}
              users={followersUsers}
            />
          </div>
        </div>
      </BaseSettingsPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('messages'),
  state => state.get('following'),
  state => state.get('followers'),
  state => state.get('users'),
  (current_user, messages, following, followers, users) => ({
    messages,
    following,
    followers,
    users,
    ...current_user
  })
);

export default connect(selector)(SettingsFollowersPage);
