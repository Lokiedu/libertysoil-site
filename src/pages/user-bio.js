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
import { List, Map as ImmutableMap } from 'immutable';

import { url as urlPropType } from '../prop-types/common';
import {
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { getName } from '../utils/user';
import { addUser } from '../actions/users';
import { removeAllMessages } from '../actions/messages';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

import ProfilePostsRiver from '../components/bio/river';
import Avatar from '../components/user/avatar';
import Button from '../components/button';
import VisibilitySensor from '../components/visibility-sensor';
import NotFound from './not-found';
import BaseUserPageWithoutHeader from './base/user-without_header';
import RiverItemCreateForm from '../components/river/type/text/create-form';

class UserBioPage extends React.Component {
  static displayName = 'UserBioPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    params: PropTypes.shape({
      username: urlPropType.isRequired
    }).isRequired
  };

  static defaultProps = {
    profile_posts: List()
  };

  static async fetchData(router, store, client) {
    try {
      const user = await client.userInfo(router.params.username);
      store.dispatch(addUser(user));

      const triggers = new ActionsTrigger(client, store.dispatch);
      await triggers.loadUserProfilePosts(user.username);
    } catch (e) {
      store.dispatch(addUser({ username: router.params.username }));
    }
  }

  constructor(props, ...args) {
    super(props, ...args);

    this.state = {
      displayLoadMore: true
    };

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
  }

  handleUpdateProfilePost = async (profilePostId, text) => {
    this.props.dispatch(removeAllMessages());
    return await this.triggers.updateProfilePost(
      profilePostId, { type: 'text', text }
    );
  };

  handleLoadMoreClick = async () => {
    const res = await this.triggers.loadUserProfilePosts(
      this.props.current_user.getIn(['user', 'username']),
      this.props.profile_posts.size
    );

    this.setState({
      displayLoadMore: res === false || res.length === 10
    });
  };

  handleLoadMoreVisibilityChange = async (isVisible) => {
    if (isVisible && !this.props.loadProfilePostsInProgress) {
      const res = await this.triggers.loadUserProfilePosts(
        this.props.current_user.getIn(['user', 'username']), this.props.profile_posts.size
      );

      this.setState({
        displayLoadMore: res === false || res.length === 10
      });
    }
  };

  render() {
    const { current_user, is_logged_in, user } = this.props;

    if (!user) {
      return null;  // not loaded yet
    }

    if (!user.get('id')) {
      return <NotFound />;
    }

    let loadMore;
    if (this.props.profile_posts.size >= 10 && this.state.displayLoadMore) {
      loadMore = (
        <div className="layout layout-align_center layout__space layout__space-double">
          <VisibilitySensor onChange={this.handleLoadMoreVisibilityChange}>
            <Button
              title="Load more..."
              waiting={this.props.loadProfilePostsInProgress}
              onClick={this.handleLoadMoreClick}
            />
          </VisibilitySensor>
        </div>
      );
    } else {
      loadMore = null;
    }

    const name = getName(user);

    return (
      <BaseUserPageWithoutHeader
        current_user={current_user}
        is_logged_in={is_logged_in}
        user={user}
      >
        <Helmet title={`${name} on `} />
        <div className="layout__grid_item layout__grid_item-fill layout__grid_item-wide">
          <div className="page_head">
            <h1 className="page_head__title">
              {name}
            </h1>
            <div className="page_head__icon">
              <Avatar user={user} size={37} />
            </div>
          </div>
          <ProfilePostsRiver
            author={user}
            current_user={current_user}
            hasMore={this.props.profile_posts.size >= 10 && this.state.displayLoadMore}
            posts={this.props.posts}
            river={this.props.profile_posts}
            triggers={this.triggers}
            onDelete={this.triggers.removeProfilePost}
            onUpdate={this.handleUpdateProfilePost}
          />
          {loadMore}
          <div className="margin--all_top">
            <div className="bio__river-item bio__river-item--type_form">
              <h5 className="bio__title">Add:</h5>
              <RiverItemCreateForm
                cancel={{ hide: true }}
                className="bio__create-post-form"
                icon={
                  <div className="bio__icon">
                    <Avatar isRound={false} size={26} user={user} />
                  </div>
                }
                input={{
                  className: 'bio__post--type_text',
                  placeholder: ''
                }}
                submit={{
                  className: 'button-wide bio__button',
                  color: 'dark_blue',
                  title: 'Post'
                }}
                onSubmit={this.handleCreateProfilePost}
              />
            </div>
          </div>
        </div>
      </BaseUserPageWithoutHeader>
    );
  }
}

const selector = createSelector(
  createSelector(
    (state, props) => state.get('users').find(user =>
      user.get('username') === props.params.username
    ),
    state => state.get('profile_posts'),
    (user, profile_posts) => ({
      profile_posts: profile_posts.get((user || ImmutableMap()).get('id')),
      user
    })
  ),
  currentUserSelector,
  state => state.get('posts'),
  state => state.getIn(['ui', 'progress', 'loadProfilePostsInProgress']),
  (userRelated, current_user, posts, loadProfilePostsInProgress) => ({
    ...userRelated,
    ...current_user,
    posts,
    loadProfilePostsInProgress
  })
);

export default connect(selector)(UserBioPage);
