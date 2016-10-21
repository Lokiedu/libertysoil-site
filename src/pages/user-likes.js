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
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import i from 'immutable';

import {
  url as urlPropType,
  uuid4 as uuid4PropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
import {
  MapOfPosts as MapOfPostsPropType,
  ArrayOfPostsId as ArrayOfPostsIdPropType
} from '../prop-types/posts';
import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  MapOfUsers as MapOfUsersPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import NotFound from './not-found';
import BaseUserLikesPage from './base/user';
import River from '../components/river_of_posts';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { setPostsToLikesRiver } from '../actions/river';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';


class UserLikesPage extends Component {
  static displayName = 'UserLikesPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    current_user: CurrentUserPropType,
    followers: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    following: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    i_am_following: ArrayOfUsersIdPropType,
    is_logged_in: PropTypes.bool.isRequired,
    likes_river: mapOfPropType(uuid4PropType, ArrayOfPostsIdPropType).isRequired,
    params: PropTypes.shape({
      username: urlPropType.isRequired
    }).isRequired,
    posts: MapOfPostsPropType.isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const userInfo = await client.userInfo(router.params.username);
    store.dispatch(addUser(userInfo));

    const likedPosts = client.getLikedPosts(router.params.username);
    store.dispatch(setPostsToLikesRiver(userInfo.id, await likedPosts));
  }

  render() {
    const {
      comments,
      current_user,
      followers,
      following,
      is_logged_in,
      likes_river,
      params,
      posts,
      ui,
      users
    } = this.props;

    const i_am_following = following.get(current_user.get('id'));
    const user = users.find(user => user.get('username') === params.username);

    if (!user) {
      return null;  // not loaded yet
    }

    if (!user.get('id')) {
      return <NotFound />;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let userLikesRiver = likes_river.get(user.get('id'));
    if (!userLikesRiver) {
      userLikesRiver = i.List();
    }

    return (
      <BaseUserLikesPage
        current_user={current_user}
        followers={followers}
        following={following}
        i_am_following={i_am_following}
        is_logged_in={is_logged_in}
        triggers={triggers}
        user={user}
      >
        <Helmet title={`Likes of ${user.get('fullName')} on `} />
        <River
          comments={comments}
          current_user={current_user}
          posts={posts}
          river={userLikesRiver}
          triggers={triggers}
          ui={ui}
          users={users}
        />
      </BaseUserLikesPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('followers'),
  state => state.get('following'),
  state => state.get('likes_river'),
  state => state.get('posts'),
  state => state.get('ui'),
  state => state.get('users'),
  (current_user, comments, followers, following, likes_river, posts, ui, users) => ({
    comments,
    followers,
    following,
    likes_river,
    posts,
    ui,
    users,
    ...current_user
  })
);

export default connect(selector)(UserLikesPage);
