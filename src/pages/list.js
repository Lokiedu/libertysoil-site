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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';
import { MapOfPosts as MapOfPostsPropType } from '../prop-types/posts';
import {
  MapOfUsers as MapOfUsersPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import VisibilitySensor from '../components/visibility-sensor';

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
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import Button from '../components/button';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import SideSuggestedUsers from '../components/side-suggested-users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions/posts';
import { clearRiver } from '../actions/river';

const client = new ApiClient(API_HOST);

export const LOAD_MORE_LIMIT = 4;

export class UnwrappedListPage extends React.Component {
  static displayName = 'UnwrappedListPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    create_post_form: PropTypes.shape({
      text: PropTypes.string.isRequired
    }),
    current_user: CurrentUserPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    posts: MapOfPostsPropType.isRequired,
    river: PropTypes.arrayOf(PropTypes.string).isRequired,
    ui: PropTypes.shape({
      progress: PropTypes.shape({
        loadRiverInProgress: PropTypes.boolean
      })
    }).isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);

    store.dispatch(clearRiver());

    await Promise.all([
      trigger.loadPostRiver(),
      trigger.loadPersonalizedSuggestions(),
      trigger.loadUserRecentTags()
    ]);
  }

  constructor(props) {
    super(props);

    this.state = {
      downloadAttemptsCount: 0,
      displayLoadMore: false
    };
  }

  componentWillMount() {
    if (this.props.river.size > LOAD_MORE_LIMIT) {
      this.setState({ displayLoadMore: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    let displayLoadMore = false;
    if (nextProps.river.size > LOAD_MORE_LIMIT) {
      displayLoadMore = true;
    }

    this.setState({ displayLoadMore });
  }

  loadPostRiverManually = async () => {
    const { river } = this.props;

    const triggers = new ActionsTrigger(client, this.props.dispatch);
    await triggers.loadPostRiver(river.size);
  }

  loadMore = async (isVisible) => {
    const { dispatch, river, ui } = this.props;

    const triggers = new ActionsTrigger(client, dispatch);

    if (isVisible && !ui.getIn(['progress', 'loadRiverInProgress']) && this.state.downloadAttemptsCount < 1) {
      this.setState({
        downloadAttemptsCount: this.state.downloadAttemptsCount + 1
      });
      const res = await triggers.loadPostRiver(river.size);

      let displayLoadMore = false;
      if (res === false) { // bad response
        displayLoadMore = true;
      } else if (res.length > 0) { // got some posts
        displayLoadMore = true;
      }
      this.setState({ displayLoadMore });
    }

    if (!isVisible) {
      this.setState({
        downloadAttemptsCount: 0
      });
    }
  };

  render() {
    const {
      comments,
      current_user,
      create_post_form,
      following,
      is_logged_in,
      posts,
      resetCreatePostForm,
      river,
      ui,
      updateCreatePostForm,
      users
    } = this.props;

    const i_am_following = following.get(current_user.get('id'));

    const actions = { resetCreatePostForm, updateCreatePostForm };
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let loadMore;
    if (this.state.displayLoadMore) {
      loadMore = (
        <div className="layout layout-align_center layout__space layout__space-double">
          <VisibilitySensor onChange={this.loadMore}>
            <Button
              title="Load more..." waiting={ui.getIn(['progress', 'loadRiverInProgress'])}
              onClick={this.loadPostRiverManually}
            />
          </VisibilitySensor>
        </div>
      );
    } else {
      loadMore = null;
    }

    return (
      <div>
        <Helmet title="News Feed of " />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo />
          <Breadcrumbs title="News Feed" />
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
                  triggers={triggers}
                  userRecentTags={current_user.get('recent_tags')}
                />
                <River
                  comments={comments}
                  current_user={current_user}
                  posts={posts}
                  river={river}
                  triggers={triggers}
                  ui={ui}
                  users={users}
                />
                {loadMore}
              </PageContent>
              <SidebarAlt>
                <AddedTags
                  geotags={create_post_form.get('geotags')}
                  hashtags={create_post_form.get('hashtags')}
                  schools={create_post_form.get('schools')}
                  truncated
                />
                <SideSuggestedUsers
                  current_user={current_user}
                  i_am_following={i_am_following}
                  triggers={triggers}
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
  state => state.get('river'),
  state => state.get('schools'),
  state => state.get('users'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, following, posts, river, schools, users, ui) => ({
    comments,
    create_post_form,
    following,
    posts,
    river,
    schools,
    users,
    ui,
    ...current_user
  })
);

const ListPage = connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(UnwrappedListPage);
export default ListPage;
