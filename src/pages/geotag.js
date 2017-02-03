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

import River from '../components/river_of_posts';

import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { TAG_LOCATION } from '../consts/tags';

import NotFound from './not-found';
import BaseTagPage from './base/tag';


export class UnwrappedGeotagPage extends Component {
  static displayName = 'UnwrappedGeotagPage';

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
    await trigger.loadUserRecentTags();

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

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const geotag = geotags.get(this.props.params.url_name);
    const title = geotag ? geotag.get('name') : this.props.params.url_name;

    if (!geotag) {
      return null;
    }

    if (!geotag.get('id')) {
      return <NotFound />;
    }

    const geotagPosts = geotag_posts.get(this.props.params.url_name) || i.List();

    return (
      <BaseTagPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        params={this.props.params}
        tag={geotag}
        type={TAG_LOCATION}
        actions={actions}
        triggers={triggers}
        schools={schools.toList()}
        postsAmount={geotagPosts.length}
        create_post_form={create_post_form}
      >
        <Helmet title={`${title} posts on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={geotagPosts}
          triggers={triggers}
          comments={comments}
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

const GeotagPage = connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(UnwrappedGeotagPage);
export default GeotagPage;
