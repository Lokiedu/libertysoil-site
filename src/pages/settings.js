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
import {API_HOST} from '../config';
import {getStore, addUser} from '../store';
import {followUser, unfollowUser} from '../triggers'
import { defaultSelector } from '../selectors';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage'

  componentDidMount () {
    SettingsPage.fetchData(this.props);
  }

  static async fetchData (props) {
    let client = new ApiClient(API_HOST);

    console.info(props);

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

  onChange = () => {
    this.setState({
      summary: 42
    });
  }

  onSave = () => {
    console.info('on save...');
  }

  render() {
    const {
      ...props
    } = this.props;

    if (!this.props.is_logged_in) {
      return false;
    }

    console.info(this.props);

    return (
      <BaseSettingsPage
        user={this.props.current_user}
        is_logged_in={this.props.is_logged_in}
        onSave={this.onSave}
      >
        <div className="paper__page">
          <h2 className="content__sub_title layout__row layout__row-small">Summary</h2>
          <textarea onChange={this.onChange} className="input input-block input-textarea content layout__row layout__row-small">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </textarea>
        </div>
        {false && <div className="paper__page">
          <h2 className="content__title">Role</h2>
        </div>}
      </BaseSettingsPage>
    )
  }
}

export default connect(defaultSelector)(SettingsPage);
