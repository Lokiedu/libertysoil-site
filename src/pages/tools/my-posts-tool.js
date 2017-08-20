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
import { replace } from 'react-router-redux';

import { uuid4, Immutable as ImmutablePropType } from '../../prop-types/common';
import { MapOfPosts } from '../../prop-types/posts';
import { MapOfUsers } from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import { ActionsTrigger } from '../../triggers';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import Button from '../../components/button';
import VisibilitySensor from '../../components/visibility-sensor';
import { OldIcon as Icon } from '../../components/icon';


const LIMIT = 25;

class MyPostsToolPage extends React.Component {
  static displayName = 'SchoolsToolPage';

  static propTypes = {
    // FIXME: [current_user, dispatch, users] are used in loadPosts, but ESLint doesn't see them :-/
    current_user: ImmutablePropType(PropTypes.shape({  // eslint-disable-line react/no-unused-prop-types
      id: uuid4
    })),
    dispatch: PropTypes.func.isRequired,  // eslint-disable-line react/no-unused-prop-types
    posts: ImmutablePropType(MapOfPosts).isRequired,
    ui: ImmutablePropType(PropTypes.shape({
      progress: ImmutablePropType(PropTypes.shape({
        loadingUserPostsRiver: PropTypes.bool
      })).isRequired
    })),
    user_posts_river: ImmutablePropType(PropTypes.arrayOf(uuid4)).isRequired,
    users: ImmutablePropType(MapOfUsers)  // eslint-disable-line react/no-unused-prop-types
  };

  static async fetchData(router, store, client) {
    const userId = store.getState().getIn(['current_user', 'id']);
    const userName = store.getState().getIn(['users', userId, 'username']);
    const trigger = new ActionsTrigger(client, store.dispatch);
    await trigger.toolsLoadUserPostsRiver(userName, { limit: LIMIT, sort: '-created_at' });
  }

  state = {
    displayLoadMore: true
  };

  handleLoadPosts = async () => {
    await this.loadPosts({
      offset: this.props.user_posts_river.size
    });
  };

  loadPosts = async (query = {}) => {
    const userId = this.props.current_user.get('id');
    const userName = this.props.users.getIn([userId, 'username']);
    const client = new ApiClient(API_HOST);
    const trigger = new ActionsTrigger(client, this.props.dispatch);
    const result = await trigger.toolsLoadUserPostsRiver(userName, {
      ...this.props.location.query,
      limit: LIMIT,
      sort: '-created_at',
      ...query
    });

    if (Array.isArray(result) && result.length < LIMIT) {
      this.setState({ displayLoadMore: false });
    } else {
      this.setState({ displayLoadMore: true });
    }
  };

  handleLoadOnSensor = async (isVisible) => {
    if (isVisible && !this.props.ui.getIn(['progress', 'loadingUserPostsRiver'])) {
      this.handleLoadPosts();
    }
  };

  handleChangeSorting = async (e) => {
    const sort = e.target.value;

    this.props.dispatch(replace({
      pathname: this.props.location.pathname,
      query: Object.assign(this.props.location.query, {
        sort
      })
    }));

    await this.loadPosts({ offset: 0, sort });
  };

  render() {
    const {
      posts,
      ui,
      user_posts_river
    } = this.props;

    const postsToDisplay = user_posts_river.map(postId => posts.get(postId));
    const sortQuery = this.props.location.query.sort || '-created_at';

    return (
      <div>
        <Helmet title="My posts on " />

        <div className="tools_page__filter">
          <span className="micon">sort</span>
          <select value={sortQuery} onChange={this.handleChangeSorting}>
            <option value="-created_at">Created at</option>
            <option value="-updated_at">Last modified</option>
          </select>
        </div>
        {postsToDisplay.map((post, index) =>
          <Link
            className="tools_item tools_item-clickable layout layout-align_justify"
            key={index}
            to={`/post/${post.get('id')}`}
          >
            <div>
              {truncate(post.get('text'), { length: 70 })}
            </div>
            <div className="layout">
              <span className="card__toolbar_item">
                <Icon icon="favorite_border" outline size="small" />
                <span className="card__toolbar_item_value">{post.get('likers').size}</span>
              </span>

              <span className="card__toolbar_item">
                <Icon icon="star_border" outline size="small" />
                <span className="card__toolbar_item_value">{post.get('favourers').size}</span>
              </span>

              <span className="card__toolbar_item" >
                <Icon icon="chat_bubble_outline" outline size="small" />
                <span className="card__toolbar_item_value">{post.get('comments')}</span>
              </span>
            </div>
          </Link>
        )}
        <div className="layout layout-align_center layout__space layout__space-double">
          {this.state.displayLoadMore && user_posts_river.size >= LIMIT &&
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
  (ui, posts, user_posts_river, users) => ({
    ui,
    posts,
    user_posts_river,
    users
  })
);

export default connect(selector)(MyPostsToolPage);
