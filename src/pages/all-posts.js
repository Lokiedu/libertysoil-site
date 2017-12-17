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
import PropTypes from 'prop-types';

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { isEqual } from 'lodash';

import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';
import { MapOfPosts as MapOfPostsPropType } from '../prop-types/posts';
import {
  MapOfUsers as MapOfUsersPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

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
import LoadableRiver from '../components/loadable-river';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import ContinentFilter from '../components/filters/continent-filter';
import SortingFilter from '../components/filters/sorting-filter';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions/posts';
import { POST_SORTING_TYPES } from '../consts/sorting';

export const LOAD_MORE_LIMIT = 4;

class AllPostsPage extends React.Component {
  static displayName = 'AllPostsPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    create_post_form: PropTypes.shape({
      text: PropTypes.string.isRequired
    }),
    current_user: CurrentUserPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    posts: MapOfPostsPropType.isRequired,
    ui: PropTypes.shape({
      progress: PropTypes.shape({
        loadRiverInProgress: PropTypes.boolean
      })
    }).isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);

    await triggers.loadAllPosts(router.location.query);
  }

  constructor(props, ...args) {
    super(props, ...args);
    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.location.query, nextProps.location.query)) {
      this.triggers.loadAllPosts(nextProps.location.query);
    }
  }

  handleForceLoadPosts = async () => {
    const { river, location } = this.props;
    const query = { ...location.query, offset: river.size };
    const { posts } = await this.triggers.loadAllPosts(query);
    return Array.isArray(posts) && posts.length > LOAD_MORE_LIMIT;
  }

  handleAutoLoadPosts = async (isVisible) => {
    if (!isVisible) {
      return undefined;
    }

    const { river, location, ui } = this.props;
    let displayLoadMore = true;
    if (!ui.getIn(['progress', 'loadAllPostsInProgress'])) {
      const query = { ...location.query, offset: river.size };
      const { posts } = await this.triggers.loadAllPosts(query);
      displayLoadMore = Array.isArray(posts) && posts.length > LOAD_MORE_LIMIT;
    }

    return displayLoadMore;
  };

  render() {
    const {
      current_user,
      create_post_form,
      is_logged_in,
      resetCreatePostForm,
      ui,
      updateCreatePostForm,
    } = this.props;

    const actions = { resetCreatePostForm, updateCreatePostForm };

    return (
      <div>
        <Helmet title="All Posts of " />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo />
          <Breadcrumbs title="News Feed" />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                {is_logged_in &&
                  <CreatePost
                    actions={actions}
                    addedGeotags={create_post_form.get('geotags')}
                    addedHashtags={create_post_form.get('hashtags')}
                    addedSchools={create_post_form.get('schools')}
                    defaultText={create_post_form.get('text')}
                    triggers={this.triggers}
                    userRecentTags={current_user.get('recent_tags')}
                  />
                }
                {this.props.river.size > 0 &&
                  <LoadableRiver
                    comments={this.props.comments}
                    current_user={current_user}
                    loadMoreLimit={LOAD_MORE_LIMIT}
                    posts={this.props.posts}
                    river={this.props.river}
                    triggers={this.triggers}
                    ui={ui}
                    users={this.props.users}
                    waiting={ui.getIn(['progress', 'loadAllPostsInProgress'])}
                    onAutoLoad={this.handleAutoLoadPosts}
                    onForceLoad={this.handleForceLoadPosts}
                  />
                }
              </PageContent>
              <SidebarAlt>
                {is_logged_in &&
                  <AddedTags
                    geotags={create_post_form.get('geotags')}
                    hashtags={create_post_form.get('hashtags')}
                    schools={create_post_form.get('schools')}
                    truncated
                  />
                }
                <ContinentFilter location={this.props.location} />
                <SortingFilter location={this.props.location} sortingTypes={POST_SORTING_TYPES} />
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
  state => state.get('posts'),
  state => state.get('all_posts'),
  state => state.get('users'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, posts, river, users, ui) => ({
    ...current_user,
    comments,
    create_post_form,
    posts,
    river,
    users,
    ui
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(AllPostsPage);
