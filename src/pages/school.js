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
import { find, values } from 'lodash';
import Helmet from 'react-helmet';

import {
  uuid4 as uuid4PropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
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

import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { setSchoolPosts, addSchool } from '../actions/schools';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import NotFound from './not-found';
import BaseTagPage from './base/tag';
import River from '../components/river_of_posts';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { TAG_SCHOOL } from '../consts/tags';


export class SchoolPage extends React.Component {
  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      school_name: PropTypes.string.isRequired
    }),
    posts: MapOfPostsPropType.isRequired,
    school_posts: mapOfPropType(uuid4PropType, ArrayOfPostsIdPropType).isRequired,
    schools: MapOfSchoolsPropType.isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    let school = client.getSchool(router.params.school_name);
    const posts = client.schoolPosts(router.params.school_name);

    try {
      school = await school;
    } catch (e) {
      store.dispatch(addSchool({ url_name: router.params.school_name }));

      return 404;
    }

    store.dispatch(addSchool(school));
    store.dispatch(setSchoolPosts(school, await posts));

    const trigger = new ActionsTrigger(client, store.dispatch);
    await Promise.all([
      trigger.loadSchools(),
      trigger.loadUserRecentTags()
    ]);

    return 200;
  }

  render() {
    const {
      comments,
      ui,
      is_logged_in,
      current_user,
      posts,
      resetCreatePostForm,
      updateCreatePostForm,
      schools,
      school_posts,
      users
    } = this.props;
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const school = find(schools, { url_name: this.props.params.school_name });

    if (!school) {
      return null; // not loaded yet
    }

    if (!school.id) {
      return <NotFound />;
    }

    const schoolPosts = school_posts[school.id] || [];

    return (
      <BaseTagPage
        params={this.props.params}
        current_user={current_user}
        tag={school}
        type={TAG_SCHOOL}
        is_logged_in={is_logged_in}
        actions={actions}
        triggers={triggers}
        schools={values(schools)}
        postsAmount={schoolPosts.length}
        create_post_form={this.props.create_post_form}
      >
        <Helmet title={`Posts about ${school.name} on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={schoolPosts}
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
}))(SchoolPage);
