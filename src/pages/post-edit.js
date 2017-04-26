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
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Helmet from 'react-helmet';

import { uuid4 as uuid4PropType } from '../prop-types/common';
import { MapOfPosts as MapOfPostsPropType } from '../prop-types/posts';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import HeaderLogo from '../components/header-logo';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import Header from '../components/header';
import Footer from '../components/footer';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import EditPost from '../components/edit-post';
import AddedTags from '../components/post/added-tags';

import { createSelector, currentUserSelector } from '../selectors';
import { ActionsTrigger } from '../triggers';
import {
  addPost,
  resetEditPostForm,
  updateEditPostForm
} from '../actions/posts';

import NotFound from './not-found';


class PostEditPage extends React.Component {
  static displayName = 'PostEditPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      uuid: uuid4PropType.isRequired
    }),
    posts: MapOfPostsPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);

    try {
      const post = await client.postInfo(router.params.uuid);
      store.dispatch(addPost(post));
    } catch (e) {
      store.dispatch(addPost({ error: true, id: router.params.uuid }));
      return 404;
    }

    await trigger.loadUserRecentTags();
    return 200;
  }

  componentDidMount() {
    if (window) {
      // make top anchor to be default
      window.scrollTo(0, 0);
    }
  }

  _handleSubmit = () => {
    browserHistory.push(getUrl(URL_NAMES.POST, { uuid: this.props.params.uuid }));
  };

  _handleDelete = () => {
    browserHistory.push('/');
  };

  render() {
    const {
      current_user,
      is_logged_in,
      posts,
      edit_post_form
    } = this.props;

    const postId = this.props.params.uuid;
    if (!posts.get(postId)) {
      // not loaded yet
      return null;
    }

    const post = posts.get(postId);
    if (post.get('error')) { // TODO: Proper 404 handling
      return <NotFound />;
    }

    if (post.get('user_id') != current_user.get('id')) {
      return null; // TODO: handle 403 properly (403 page)
    }

    const actions = _.pick(this.props, 'resetEditPostForm', 'updateEditPostForm');
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Helmet title={`Edit "${post.getIn(['more', 'pageTitle'])}" post on `} />
        <Header
          current_user={current_user}
          is_logged_in={is_logged_in}
        >
          <HeaderLogo />
          <Breadcrumbs title="Edit post" />
        </Header>
        <Page>
          <PageMain>
            <PageBody>
              <Sidebar current_user={current_user} />
              <PageContent>
                <EditPost
                  actions={actions}
                  geotags={edit_post_form.get('geotags')}
                  hashtags={edit_post_form.get('hashtags')}
                  id={edit_post_form.get('id')}
                  post={post}
                  schools={edit_post_form.get('schools')}
                  triggers={triggers}
                  userRecentTags={current_user.get('recent_tags')}
                  onDelete={this._handleDelete}
                  onSubmit={this._handleSubmit}
                />
              </PageContent>
              <SidebarAlt>
                <AddedTags
                  geotags={edit_post_form.get('geotags')}
                  hashtags={edit_post_form.get('hashtags')}
                  schools={edit_post_form.get('schools')}
                  truncated
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
  state => state.get('posts'),
  state => state.get('schools'),
  state => state.get('edit_post_form'),
  (current_user, posts, schools, edit_post_form) => ({
    posts,
    schools,
    edit_post_form,
    ...current_user
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetEditPostForm, updateEditPostForm }, dispatch)
}))(PostEditPage);
