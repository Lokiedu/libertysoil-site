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

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { addGeotag, setGeotagPosts } from '../actions/geotags';

import NotFound from './not-found';
import River from '../components/river_of_posts';
import BaseTagPage from './base/tag';

import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { TAG_LOCATION } from '../consts/tags';

export class GeotagPage extends Component {
  static displayName = 'GeotagPage';

  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    geotag_posts: mapOfPropType(urlPropType, ArrayOfPostsIdPropType).isRequired,
    geotags: MapOfGeotagsPropType.isRequired,
    params: PropTypes.shape({
      url_name: PropTypes.string.isRequired
    }),
    posts: MapOfPostsPropType.isRequired,
    schools: MapOfSchoolsPropType.isRequired
  };

  static async fetchData(params, store, client) {
    let geotag = client.getGeotag(params.url_name);
    const geotagPosts = client.geotagPosts(params.url_name);

    try {
      geotag = await geotag;
    } catch (e) {
      store.dispatch(addGeotag({ url_name: params.url_name }));

      return 404;
    }

    store.dispatch(addGeotag(geotag));
    store.dispatch(setGeotagPosts(params.url_name, await geotagPosts));

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

    const geotag = geotags[this.props.params.url_name];
    const title = geotag ? geotag.name : this.props.params.url_name;

    if (!geotag) {
      return null;
    }

    if (!geotag.id) {
      return <NotFound />;
    }

    const geotagPosts = geotag_posts[this.props.params.url_name] || [];

    return (
      <BaseTagPage
        params={this.props.params}
        current_user={current_user}
        tag={geotag}
        type={TAG_LOCATION}
        is_logged_in={is_logged_in}
        actions={actions}
        triggers={triggers}
        schools={values(schools)}
        postsAmount={geotagPosts.length}
        create_post_form={this.props.create_post_form}
      >
        <Helmet title={`${title} posts on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={geotagPosts}
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
}))(GeotagPage);
