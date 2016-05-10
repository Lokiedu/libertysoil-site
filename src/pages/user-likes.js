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
import React, {
  Component
} from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Helmet from 'react-helmet';

import NotFound from './not-found'
import BaseUserLikesPage from './base/user'
import River from '../components/river_of_posts';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { addUser, setPostsToLikesRiver } from '../actions';
import { ActionsTrigger } from '../triggers'
import { defaultSelector } from '../selectors';


class UserLikesPage extends Component {
  static displayName = 'UserLikesPage';

  static async fetchData(params, store, client) {
    const userInfo = await client.userInfo(params.username);
    store.dispatch(addUser(userInfo));

    const likedPosts = client.getLikedPosts(params.username);
    store.dispatch(setPostsToLikesRiver(userInfo.id, await likedPosts));
  }

  render () {
    const page_user = _.find(this.props.users, { username: this.props.params.username });
    const {
      posts,
      current_user,
      users,
      comments,
      ui,
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

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseUserLikesPage
        current_user={this.props.current_user}
        following={following}
        followers={followers}
        i_am_following={this.props.i_am_following}
        is_logged_in={this.props.is_logged_in}
        page_user={page_user}
        triggers={triggers}
      >
        <Helmet title={`Likes of ${page_user.fullName} on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={this.props.likes_river[page_user.id]}
          triggers={triggers}
          users={users}
          comments={comments}
          ui={ui}
        />
      </BaseUserLikesPage>
    )
  }
}

export default connect(defaultSelector)(UserLikesPage);
