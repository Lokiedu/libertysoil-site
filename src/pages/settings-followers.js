/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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

import BaseSettingsPage from './base/settings'

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore, addUser } from '../store';
import { changePassword } from '../triggers'
import { defaultSelector } from '../selectors';

class SettingsFollowersPage extends React.Component {
  static displayName = 'SettingsPasswordPage'

  componentDidMount () {
    SettingsFollowersPage.fetchData(this.props);
  }

  static async fetchData (props) {
    let client = new ApiClient(API_HOST);

    if (!props.current_user_id) {
      return;
    }

    try {
      let userInfo = client.userInfo(props.users[props.current_user_id].username);
      getStore().dispatch(addUser(await userInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      follows,
      ...props
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <BaseSettingsPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        onSave={this.onSave}
        messages={messages}
        following={following}
        follows={follows}
      >
        <div className="paper__page">
          <h1 className="content__title">Manage Followers</h1>
        </div>
        <div className="paper__page">
          <h2 className="content__sub_title layout__row">People you follow</h2>
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-50">
                user
              </div>
              <div className="layout__grid_item layout__grid_item-50">
                user
              </div>
            </div>
          </div>
        </div>
        <div className="paper__page">
          <h2 className="content__sub_title layout__row">Following you</h2>
        </div>
      </BaseSettingsPage>
    )
  }
}

export default connect(defaultSelector)(SettingsFollowersPage);
