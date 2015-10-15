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
import _ from 'lodash';

import NotFound from './not-found'
import BaseSettingsPage from './base/settings'

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import {getStore, addUser, setUserPosts, addError} from '../store';
import {followUser, unfollowUser, likePost, unlikePost} from '../triggers'

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage'

  componentDidMount () {
    SettingsPage.fetchData(this.props);
  }

  static async fetchData (props) {
    let client = new ApiClient(API_HOST);

    if (!props.current_user) {
      return;
    }

    try {
      const user = props.users[props.current_user];
      let userInfo = client.userInfo(user.username);

      getStore().dispatch(addUser(await userInfo));
      //getStore().dispatch(setUserPosts(await userPosts));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render () {
    const user = this.props.users[this.props.current_user];

    let i_am_following;
    if (this.props.is_logged_in) {
      user.likes = this.props.likes[this.props.current_user];
      user.favourites = this.props.favourites[this.props.current_user];
      i_am_following = this.props.following[user.id];
    } else {
      return false;
    }

    let user_triggers = {followUser, unfollowUser};
    let post_triggers = {likePost, unlikePost};

    return (
      <BaseSettingsPage
        user={user}
        i_am_following={i_am_following}
        is_logged_in={this.props.is_logged_in}
        triggers={user_triggers}
      >
        Settings...
      </BaseSettingsPage>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(SettingsPage);
