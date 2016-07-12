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

import { MapOfSchools as MapOfSchoolsPropType } from '../prop-types/schools';
import { uuid4 as uuid4PropType } from '../prop-types/common';
import { MapOfPosts as MapOfPostsPropType } from '../prop-types/posts';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import NotFound from './not-found';
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

import { defaultSelector } from '../selectors';
import { ActionsTrigger } from '../triggers';
import {
  addPost,
  resetEditPostForm,
  updateEditPostForm
} from '../actions/posts';

class PostEditPage extends React.Component {
  static displayName = 'PostEditPage';

  static propTypes = {
    params: PropTypes.shape({
      uuid: uuid4PropType.isRequired
    }),
    posts: MapOfPostsPropType.isRequired,
    schools: MapOfSchoolsPropType.isRequired
  };

  static async fetchData(params, store, client) {
    const noSchoolsLoaded = store.getState().get('schools').isEmpty();
    const trigger = new ActionsTrigger(client, store.dispatch);
    let schoolsPromise;

    if (noSchoolsLoaded) {
      schoolsPromise = trigger.loadSchools();
    }

    try {
      const post = await client.postInfo(params.uuid);
      store.dispatch(addPost(post));
    } catch (e) {
      store.dispatch(addPost({ error: true, id: params.uuid, user: {} }));

      return 404;
    }

    if (noSchoolsLoaded) {
      await schoolsPromise;
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
      posts
    } = this.props;
    const postId = this.props.params.uuid;

    if (!(postId in posts)) {
      // not loaded yet
      return null;
    }

    const post = posts[postId];

    if (post.error) {
      return <NotFound />;
    }

    if (post.user_id != current_user.id) {
      return null;
    }

    const actions = _.pick(this.props, 'resetEditPostForm', 'updateEditPostForm');
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const formState = this.props.edit_post_form;

    return (
      <div>
        <Helmet title={`Edit "${post.more.pageTitle}" post on `} />
        <Header
          is_logged_in={this.props.is_logged_in}
          current_user={current_user}
        >
          <HeaderLogo small />
          <Breadcrumbs title="Edit post" />
        </Header>
        <Page>
          <Sidebar current_user={current_user} />
          <PageMain>
            <PageBody>
              <PageContent>
                <EditPost
                  actions={actions}
                  allSchools={_.values(this.props.schools)}
                  userRecentTags={current_user.recent_tags}
                  post={post}
                  triggers={triggers}
                  onDelete={this._handleDelete}
                  onSubmit={this._handleSubmit}
                  {...formState}
                />
              </PageContent>
              <SidebarAlt>
                <AddedTags {...formState} truncated />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>
        <Footer />
      </div>
    );
  }
}

export default connect(defaultSelector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetEditPostForm, updateEditPostForm }, dispatch)
}))(PostEditPage);
