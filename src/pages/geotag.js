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
import { values } from 'lodash';

import {
  url as urlPropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
import { MapOfGeotags as MapOfGeotagsPropType } from '../prop-types/geotags';
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
import { addGeotag, setGeotagPosts } from '../actions/geotags';

import NotFound from './not-found';
import River from '../components/river_of_posts';
import BaseTagPage from './base/tag';

import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { TAG_LOCATION } from '../consts/tags';

export class GeotagPage extends Component {
  static displayName = 'GeotagPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    current_user: CurrentUserPropType,
    geotag_posts: mapOfPropType(urlPropType, ArrayOfPostsIdPropType).isRequired,
    geotags: MapOfGeotagsPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      url_name: PropTypes.string.isRequired
    }),
    posts: MapOfPostsPropType.isRequired,
    schools: MapOfSchoolsPropType.isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    let geotag = client.getGeotag(router.params.url_name);
    const geotagPosts = client.geotagPosts(router.params.url_name);

    try {
      geotag = await geotag;
    } catch (e) {
      store.dispatch(addGeotag({ url_name: router.params.url_name }));

      return 404;
    }

    store.dispatch(addGeotag(geotag));
    store.dispatch(setGeotagPosts(router.params.url_name, await geotagPosts));

    const trigger = new ActionsTrigger(client, store.dispatch);
    Promise.all([
      trigger.loadSchools(),
      trigger.loadUserRecentTags()
    ]);

    return 200;
  }

  render() {
    const {
      ui,
      comments,
      create_post_form,
      is_logged_in,
      current_user,
      posts,
      resetCreatePostForm,
      updateCreatePostForm,
      geotags,
      geotag_posts,
      users,
      schools
    } = this.props;

    const comments_js = comments.toJS(); // FIXME #662
    const create_post_form_js = create_post_form.toJS(); // FIXME #662
    const current_user_js = current_user.toJS(); // FIXME #662
    const geotags_js = geotags.toJS(); // FIXME #662
    const geotag_posts_js = geotag_posts.toJS(); // FIXME #662
    const posts_js = posts.toJS(); // FIXME #662
    const users_js = users.toJS(); // FIXME #662
    const schools_js = schools.toJS(); // FIXME #662
    const ui_js = ui.toJS(); // FIXME #662

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const geotag = geotags_js[this.props.params.url_name];
    const title = geotag ? geotag.name : this.props.params.url_name;

    if (!geotag) {
      return null;
    }

    if (!geotag.id) {
      return <NotFound />;
    }

    const geotagPosts = geotag_posts_js[this.props.params.url_name] || [];

    return (
      <BaseTagPage
        current_user={current_user_js}
        is_logged_in={is_logged_in}
        params={this.props.params}
        tag={geotag}
        type={TAG_LOCATION}
        actions={actions}
        triggers={triggers}
        schools={values(schools_js)}
        postsAmount={geotagPosts.length}
        create_post_form={create_post_form_js}
      >
        <Helmet title={`${title} posts on `} />
        <River
          current_user={current_user_js}
          posts={posts_js}
          river={geotagPosts}
          triggers={triggers}
          comments={comments_js}
          ui={ui_js}
          users={users_js}
        />
      </BaseTagPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('create_post_form'),
  state => state.get('geotags'),
  state => state.get('geotag_posts'),
  state => state.get('posts'),
  state => state.get('schools'),
  state => state.get('users'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, geotags, geotag_posts, posts, schools, users, ui) => ({
    comments,
    create_post_form,
    geotags,
    geotag_posts,
    posts,
    schools,
    users,
    ui,
    ...current_user
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(GeotagPage);
