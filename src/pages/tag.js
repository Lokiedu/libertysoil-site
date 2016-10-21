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
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import i from 'immutable';

import {
  url as urlPropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
import { MapOfHashtags as MapOfHashtagsPropType } from '../prop-types/hashtags';
import { MapOfSchools as MapOfSchoolsPropType } from '../prop-types/schools';
import {
  ArrayOfPostsId as ArrayOfPostsIdPropType,
  MapOfPosts as MapOfPostsPropType
} from '../prop-types/posts';
import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';
import {
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { addHashtag, setHashtagPosts } from '../actions/hashtags';

import NotFound from './not-found';
import River                from '../components/river_of_posts';
import { ActionsTrigger }   from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { TAG_HASHTAG }      from '../consts/tags';
import BaseTagPage from './base/tag';

export class TagPage extends Component {
  static displayName = 'TagPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    current_user: CurrentUserPropType,
    hashtags: MapOfHashtagsPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      tag: PropTypes.string.isRequired
    }),
    posts: MapOfPostsPropType.isRequired,
    schools: MapOfSchoolsPropType.isRequired,
    tag_posts: mapOfPropType(urlPropType, ArrayOfPostsIdPropType).isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    let hashtag = client.getHashtag(router.params.tag);
    const tagPosts = client.tagPosts(router.params.tag);

    try {
      hashtag = await hashtag;
    } catch (e) {
      store.dispatch(addHashtag({ name: router.params.tag }));

      return 404;
    }

    store.dispatch(addHashtag(hashtag));
    store.dispatch(setHashtagPosts(router.params.tag, await tagPosts));

    const trigger = new ActionsTrigger(client, store.dispatch);
    Promise.all([
      trigger.loadSchools(),
      trigger.loadUserRecentTags()
    ]);

    return 200;
  }

  render() {
    const {
      comments,
      create_post_form,
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
      ui
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const tag = hashtags.get(params.tag);

    if (!tag) {
      return null;
    }

    if (!tag.get('id')) {
      return <NotFound />;
    }

    const thisTagPosts = tag_posts.get(tag.get('name')) || i.List();

    return (
      <BaseTagPage
        actions={actions}
        create_post_form={create_post_form}
        current_user={current_user}
        is_logged_in={is_logged_in}
        params={this.props.params}
        postsAmount={thisTagPosts.length}
        schools={schools.toList()}
        tag={tag}
        triggers={triggers}
        type={TAG_HASHTAG}
      >
        <Helmet title={`"${tag.get('name')}" posts on `} />
        <River
          comments={comments}
          current_user={current_user}
          posts={posts}
          river={thisTagPosts}
          triggers={triggers}
          ui={ui}
          users={users}
        />
      </BaseTagPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('create_post_form'),
  state => state.get('posts'),
  state => state.get('tag_posts'),
  state => state.get('users'),
  state => state.get('hashtags'),
  state => state.get('schools'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, posts, tag_posts, users, hashtags, schools, ui) => ({
    comments,
    create_post_form,
    posts,
    tag_posts,
    users,
    hashtags,
    schools,
    ui,
    ...current_user
  })
);


export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(TagPage);
