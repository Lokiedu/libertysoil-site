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
import _ from 'lodash';
import Helmet from 'react-helmet';

import { MapOfPosts as MapOfPostsPropType } from '../prop-types/posts';
import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';

import NotFound from './not-found';
import BaseUserPage from './base/user';
import River from '../components/river_of_posts';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { addUser } from '../actions/users';
import { setUserPosts } from '../actions/posts';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';


class UserPage extends React.Component {
  static displayName = 'UserPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    location: PropTypes.shape({}).isRequired,
    posts: MapOfPostsPropType.isRequired
  };

  static childContextTypes = {
    routeLocation: PropTypes.shape({}).isRequired // not jush 'location' to prevent misleading warnings
  };

  static async fetchData(params, store, client) {
    const userInfo = await client.userInfo(params.username);
    const userPosts = client.userPosts(params.username);

    store.dispatch(addUser(userInfo));
    store.dispatch(setUserPosts(userInfo.id, await userPosts));
  }

  getChildContext() {
    const { location } = this.props;

    return { routeLocation: location };
  }

  render() {
    const page_user = _.find(this.props.users, { username: this.props.params.username });
    const {
      ui,
      users,
      comments,
      following,
      followers,
      posts
    } = this.props;

    if (_.isUndefined(page_user)) {
      return null;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound />;
    }

    const user_posts = this.props.user_posts[page_user.id];

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseUserPage
        current_user={this.props.current_user}
        following={following}
        followers={followers}
        i_am_following={this.props.i_am_following}
        is_logged_in={this.props.is_logged_in}
        page_user={page_user}
        triggers={triggers}
      >
        <Helmet title={`Posts of ${page_user.fullName} on `} />
        <River
          comments={comments}
          current_user={this.props.current_user}
          posts={posts}
          river={user_posts}
          triggers={triggers}
          users={users}
          ui={ui}
        />
      </BaseUserPage>
    );
  }
}

export default connect(defaultSelector)(UserPage);
