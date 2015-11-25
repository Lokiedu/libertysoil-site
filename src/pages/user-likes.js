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
import BaseUserLikesPage from './base/user'
import River from '../components/river_of_posts';

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import {getStore, addUser, setPostsToLikesRiver, addError} from '../store';
import {followUser, unfollowUser, likePost, unlikePost, favPost, unfavPost} from '../triggers'
import { defaultSelector } from '../selectors';

class UserLikesPage extends React.Component {
  static displayName = 'UserLikesPage'

  static async fetchData(params, props, client) {
    try {
      let userInfo = await client.userInfo(params.username);
      getStore().dispatch(addUser(userInfo));

      let likedPosts = client.getLikedPosts(params.username);
      getStore().dispatch(setPostsToLikesRiver(userInfo.id, await likedPosts));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render () {
    let page_user = _.find(this.props.users, {username: this.props.params.username});
    const {
      following,
      followers
    } = this.props;

    if (_.isUndefined(page_user)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound/>
    }

    //console.info(this.props);

    let user_triggers = {followUser, unfollowUser};
    let post_triggers = {likePost, unlikePost, favPost, unfavPost};

    return (
      <BaseUserLikesPage
        current_user={this.props.current_user}
        following={following}
        followers={followers}
        i_am_following={this.props.i_am_following}
        is_logged_in={this.props.is_logged_in}
        page_user={page_user}
        triggers={user_triggers}
      >
        <River
          current_user={this.props.current_user}
          posts={this.props.posts}
          river={this.props.likes_river[page_user.id]}
          triggers={post_triggers}
          users={this.props.users}
        />
      </BaseUserLikesPage>
    )
  }
}

export default connect(defaultSelector)(UserLikesPage);
