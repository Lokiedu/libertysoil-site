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
import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BaseSettingsPage from './base/settings';
import UserGrid from '../components/user-grid';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';

class SettingsFollowersPage extends React.Component {
  static displayName = 'SettingsPasswordPage';

  static async fetchData(params, store, client) {
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
      i_am_following,
      messages,
      following,
      followers,
      users
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let followingUsers = following[current_user.id] || [];
    let followersUsers = followers[current_user.id] || [];

    followingUsers = followingUsers.map(user_id => users[user_id]);
    followersUsers = followersUsers.map(user_id => users[user_id]);

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

export default connect(defaultSelector)(SettingsFollowersPage);
