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
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { values } from 'lodash';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import {
  addHashtag,
  setTagPosts,
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions';

import NotFound from './not-found';
import River                from '../components/river_of_posts';
import { ActionsTrigger }   from '../triggers';
import { defaultSelector }  from '../selectors';
import { TAG_HASHTAG }      from '../consts/tags';
import BaseTagPage from './base/tag';

export class TagPage extends Component {
  static displayName = 'TagPage';

  static propTypes = {
    tag_posts: PropTypes.shape().isRequired,
    hashtags: PropTypes.shape().isRequired,
    params: PropTypes.shape({
      tag: PropTypes.string.isRequired
    })
  };

  static async fetchData(params, store, client) {
    let hashtag = client.getHashtag(params.tag);
    let tagPosts = client.tagPosts(params.tag);

    try {
      hashtag = await hashtag;
    } catch (e) {
      store.dispatch(addHashtag({ name: params.tag }));

      return 404;
    }

    store.dispatch(addHashtag(hashtag));
    store.dispatch(setTagPosts(params.tag, await tagPosts));

    const trigger = new ActionsTrigger(client, store.dispatch);
    Promise.all([
      trigger.loadSchools(),
      trigger.loadUserRecentTags()
    ]);

    return 200;
  }

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      tag_posts,
      resetCreatePostForm,
      updateCreatePostForm,
      users,
      params,
      hashtags,
      schools,
      ui,
      comments
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const tag = hashtags[params.tag];

    if (!tag) {
      return <script />;
    }

    if (!tag.id) {
      return <NotFound/>;
    }

    const thisTagPosts = tag_posts[tag.name] || [];

    return (
      <BaseTagPage
        params={this.props.params}
        current_user={current_user}
        tag={tag}
        type={TAG_HASHTAG}
        is_logged_in={is_logged_in}
        actions={actions}
        triggers={triggers}
        schools={values(schools)}
        postsAmount={thisTagPosts.length}
        create_post_form={this.props.create_post_form}
      >
        <Helmet title={`"${tag.name}" posts on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={thisTagPosts}
          triggers={triggers}
          users={users}
          comments={comments}
          ui={ui}
        />
      </BaseTagPage>
    );
  }
}

export default connect(defaultSelector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(TagPage);
