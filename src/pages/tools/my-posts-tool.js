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
import { Link } from 'react-router';
import { truncate } from 'grapheme-utils';

import { uuid4, Immutable as ImmutablePropType } from '../../prop-types/common';
import { MapOfPosts } from '../../prop-types/posts';
import { MapOfUsers } from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { ActionsTrigger } from '../../triggers';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import Button from '../../components/button';
import VisibilitySensor from '../../components/visibility-sensor';


class MyPostsToolPage extends React.Component {
  static displayName = 'SchoolsToolPage';

  static propTypes = {
    current_user: ImmutablePropType(PropTypes.shape({
      id: uuid4
    })),
    dispatch: PropTypes.func.isRequired,
    posts: ImmutablePropType(MapOfPosts).isRequired,
    ui: ImmutablePropType(PropTypes.shape({
      progress: ImmutablePropType(PropTypes.shape({
        loadingUserPostsRiver: PropTypes.bool
      })).isRequired
    })),
    user_posts_river: ImmutablePropType(PropTypes.arrayOf(uuid4)).isRequired,
    users: ImmutablePropType(MapOfUsers)
  };

  static async fetchData(router, store, client) {
    const userId = store.getState().getIn(['current_user', 'id']);
    const userName = store.getState().getIn(['users', userId, 'username']);
    const trigger = new ActionsTrigger(client, store.dispatch);
    await trigger.toolsLoadUserPostsRiver(userName, { limit: 25, sort: '-created_at' });
  }

  state = {
    displayLoadMore: true
  };

  handleLoadPosts = async () => {
    const userId = this.props.current_user.get('id');
    const userName = this.props.users.getIn([userId, 'username']);
    const client = new ApiClient(API_HOST);
    const trigger = new ActionsTrigger(client, this.props.dispatch);
    const result = await trigger.toolsLoadUserPostsRiver(userName, {
      limit: 25,
      offset: this.props.user_posts_river.size,
      sort: '-created_at'
    });

    if (Array.isArray(result) && result.length === 0) {
      this.setState({ displayLoadMore: false });
    }
  };

  handleLoadOnSensor = async (isVisible) => {
    if (isVisible && !this.props.ui.getIn(['progress', 'loadingUserPostsRiver'])) {
      this.handleLoadPosts();
    }
  };

  render() {
    const {
      posts,
      ui,
      user_posts_river
    } = this.props;

    const postsToDisplay = user_posts_river.map(postId => posts.get(postId));

    return (
      <div>
        <Helmet title="My posts tool on " />
        {postsToDisplay.map((post, index) =>
          <div className="tools_page__item" key={index}>
            <Link to={`/post/${post.get('id')}`}>{truncate(post.get('text'), { length: 70 })}</Link>
          </div>
        )}
        <div className="layout layout-align_center layout__space layout__space-double">
          {this.state.displayLoadMore &&
            <VisibilitySensor onChange={this.handleLoadOnSensor}>
              <Button
                title="Load more..."
                waiting={ui.getIn(['progress', 'loadingUserPostsRiver'])}
                onClick={this.handleLoadPosts}
              />
            </VisibilitySensor>
          }
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.get('ui'),
  state => state.get('posts'),
  state => state.getIn(['tools', 'user_posts_river']),
  state => state.get('users'),
  currentUserSelector,
  (ui, posts, user_posts_river, users, current_user) => ({
    ui,
    posts,
    user_posts_river,
    users,
    ...current_user
  })
);

export default connect(selector)(MyPostsToolPage);
