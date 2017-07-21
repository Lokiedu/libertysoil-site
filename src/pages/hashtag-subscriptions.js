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
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { API_HOST } from '../config';
import ApiClient from '../api/client';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import CreatePost from '../components/create-post';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import LoadableRiver from '../components/loadable-river';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import SideSuggestedUsers from '../components/side-suggested-users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions/posts';


export const LOAD_MORE_LIMIT = 4;

class HashtagSubscriptionsPage extends React.Component {
  static async fetchData(router, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);

    await Promise.all([
      trigger.loadHashtagSubscriptions(),
      trigger.loadPersonalizedSuggestions(),
      trigger.loadUserRecentTags()
    ]);
  }

  constructor(props, ...args) {
    super(props, ...args);

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  handleForceLoadPosts = async () => {
    const { river } = this.props;
    const res = await this.triggers.loadHashtagSubscriptions({ offset: river.size, limit: LOAD_MORE_LIMIT });
    return Array.isArray(res) && res.length > LOAD_MORE_LIMIT;
  }

  handleAutoLoadPosts = async (isVisible) => {
    if (!isVisible) {
      return undefined;
    }

    const { river, ui } = this.props;
    let displayLoadMore = true;
    if (isVisible && !ui.getIn(['progress', 'loadHashtagSubscriptionsRiver'])) {
      const res = await this.triggers.loadHashtagSubscriptions({ offset: river.size, limit: LOAD_MORE_LIMIT });
      displayLoadMore = Array.isArray(res) && res.length > LOAD_MORE_LIMIT;
    }

    return displayLoadMore;
  };

  render() {
    const {
      create_post_form,
      current_user,
      ui,
      resetCreatePostForm,
      updateCreatePostForm
    } = this.props;

    const actions = { resetCreatePostForm, updateCreatePostForm };
    const i_am_following = this.props.following.get(current_user.get('id'));

    return (
      <div>
        <Helmet title="Hashtag Subscriptions of " />
        <Header
          current_user={current_user}
          is_logged_in={this.props.is_logged_in}
        >
          <HeaderLogo />
          <Breadcrumbs title="Hashtag Subscriptions" />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <CreatePost
                  actions={actions}
                  addedGeotags={create_post_form.get('geotags')}
                  addedHashtags={create_post_form.get('hashtags')}
                  addedSchools={create_post_form.get('schools')}
                  defaultText={create_post_form.get('text')}
                  triggers={this.triggers}
                  userRecentTags={current_user.get('recent_tags')}
                />
                <LoadableRiver
                  comments={this.props.comments}
                  current_user={current_user}
                  loadMoreLimit={LOAD_MORE_LIMIT}
                  posts={this.props.posts}
                  river={this.props.river}
                  triggers={this.triggers}
                  ui={ui}
                  users={this.props.users}
                  waiting={ui.getIn(['progress', 'loadHashtagSubscriptionsRiver'])}
                  onAutoLoad={this.handleAutoLoadPosts}
                  onForceLoad={this.handleForceLoadPosts}
                />
              </PageContent>
              <SidebarAlt>
                <SideSuggestedUsers
                  current_user={current_user}
                  i_am_following={i_am_following}
                  triggers={this.triggers}
                  users={current_user.get('suggested_users')}
                />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('create_post_form'),
  state => state.get('following'),
  state => state.get('posts'),
  state => state.getIn(['tag_subscriptions', 'hashtag_subscriptions_river']),
  state => state.get('schools'),
  state => state.get('users'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, following, posts, river, schools, users, ui) => ({
    ...current_user,
    comments,
    create_post_form,
    following,
    posts,
    river,
    schools,
    users,
    ui
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(HashtagSubscriptionsPage);
