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
import { List } from 'immutable';

import {
  CurrentUser as CurrentUserPropType
} from '../../prop-types/users';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { removeAllMessages } from '../../actions/messages';
import { ActionsTrigger } from '../../triggers';
import { createSelector, currentUserSelector } from '../../selectors';

import Button from '../../components/button';
import User from '../../components/user';
import VisibilitySensor from '../../components/visibility-sensor';
import RiverItemCreateForm from '../../components/river/type/text/create-form';
import ProfilePostsRiver from '../../components/bio/river';
import BioInformer from '../../components/bio/informer';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    loadProfilePostsInProgress: PropTypes.bool,
    profile_posts: PropTypes.arrayOf(PropTypes.shape()).isRequired
  };

  static defaultProps = {
    profile_posts: List()
  };

  static async fetchData(router, store, client) {
    const props = store.getState();
    const currentUserId = props.getIn(['current_user', 'id']);
    if (currentUserId === null) {
      return;
    }

    const triggers = new ActionsTrigger(client, store.dispatch);
    const currentUser = props.get('users').get(currentUserId);

    await Promise.all([
      triggers.loadUserInfo(currentUser.get('username')),
      triggers.loadUserProfilePosts(currentUser.get('username'))
    ]);
  }

  constructor(props, ...args) {
    super(props, ...args);

    this.state = {
      displayLoadMore: true
    };

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
  }

  handleCreateProfilePost = async (text) => {
    this.props.dispatch(removeAllMessages());
    return await this.triggers.createProfilePost({ type: 'text', text });
  };

  handleUpdateProfilePost = async (profilePostId, text) => {
    this.props.dispatch(removeAllMessages());
    return await this.triggers.updateProfilePost(
      profilePostId, { type: 'text', text }
    );
  };

  handleRemoveProfilePost = async (profilePost) => {
    this.props.dispatch(removeAllMessages());
    const user = this.props.current_user.get('user');
    return await this.triggers.removeProfilePost(profilePost, user);
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
    if (!this.props.is_logged_in) {
      return false;
    }

    const { current_user } = this.props;
    const user = current_user.get('user');

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

    return (
      <div>
        <Helmet title="Your Profile Settings on " />
        <ProfilePostsRiver
          author={user}
          current_user={current_user}
          hasMore={this.props.profile_posts.size >= 10 && this.state.displayLoadMore}
          posts={this.props.posts}
          river={this.props.profile_posts}
          onDelete={this.triggers.removeProfilePost}
          onUpdate={this.handleUpdateProfilePost}
        />
        {loadMore}

        <BioInformer username={user.get('username')} />

        <div className="bio__create-post">
          <h5 className="bio__title">Add a new post to your Bio:</h5>
          <div className="bio__river-item bio__river-item--type_form">
            <RiverItemCreateForm
              cancel={{ hide: true }}
              className="bio__create-post-form"
              icon={
                <div className="bio__icon">
                  <User
                    avatar={{ isRound: false, size: 26 }}
                    text={{ hide: true }}
                    user={user}
                  />
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
    );
  }
}

const selector = createSelector(
  createSelector(
    currentUserSelector,
    state => state.get('profile_posts'),
    (currentUser, profile_posts) => ({
      ...currentUser,
      profile_posts: profile_posts.get(currentUser.current_user.get('id'))
    })
  ),
  state => state.get('posts'),
  state => state.getIn(['ui', 'progress', 'loadProfilePostsInProgress']),
  (userRelated, posts, loadProfilePostsInProgress) => ({
    ...userRelated,
    posts,
    loadProfilePostsInProgress
  })
);

export default connect(selector)(SettingsPage);
