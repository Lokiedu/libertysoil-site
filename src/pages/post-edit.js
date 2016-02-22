/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { pushPath } from 'redux-simple-router';

import NotFound from './not-found'
import Header from '../components/header';
import Footer from '../components/footer';
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import { addPost } from '../actions';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import EditPost from '../components/edit-post';
import AddedTags from '../components/post/added-tags';

import { defaultSelector } from '../selectors';
import { ActionsTrigger } from '../triggers';
import {
  resetEditPostForm,
  updateEditPostForm
} from '../actions';


class PostEditPage extends React.Component {
  static displayName = 'PostEditPage';

  static async fetchData(params, store, client) {
    const noSchoolsLoaded = store.getState().get('schools').isEmpty();
    let schoolsPromise;

    if (noSchoolsLoaded) {
      let trigger = new ActionsTrigger(client, store.dispatch);
      schoolsPromise = trigger.loadSchools();
    }

    try {
      let post = await client.postInfo(params.uuid);
      store.dispatch(addPost(post));
    } catch (e) {
      store.dispatch(addPost({error: true, id: params.uuid, user: {}}));

      return 404;
    }

    if (noSchoolsLoaded) {
      await schoolsPromise;
    }

    return 200;
  }

  _handleSubmit = () => {
    this.props.dispatch(pushPath(getUrl(URL_NAMES.POST, {uuid: this.props.params.uuid})));
  };

  _handleDelete = () => {
    this.props.dispatch(pushPath('/'));
  };

  render() {
    let postId = this.props.params.uuid;

    if (!(postId in this.props.posts)) {
      // not loaded yet
      return null;
    }

    let post = this.props.posts[postId];

    if (post.error) {
      return <NotFound/>;
    }

    if (post.user_id != this.props.current_user.id) {
      return null;
    }

    let actions = _.pick(this.props, 'resetEditPostForm', 'updateEditPostForm');
    let client = new ApiClient(API_HOST);
    let postTriggers = _.pick(new ActionsTrigger(client, this.props.dispatch), 'updatePost', 'deletePost');
    let formState = this.props.edit_post_form;

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user}/>

            <div className="page__content">
              <EditPost
                actions={actions}
                allSchools={_.values(this.props.schools)}
                post={post}
                triggers={postTriggers}
                onDelete={this._handleDelete}
                onSubmit={this._handleSubmit}
                {...formState}
              />
            </div>

            <SidebarAlt>
              <AddedTags {...formState} />
            </SidebarAlt>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector, dispatch => ({
  dispatch,
  ...bindActionCreators({resetEditPostForm, updateEditPostForm}, dispatch)
}))(PostEditPage);
