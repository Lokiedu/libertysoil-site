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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import {API_HOST} from '../config';
import ApiClient from '../api/client'
import NotFound from './not-found'
import BaseSchoolPage from './base/school'
import River from '../components/river_of_posts';
import { addSchool, setSchoolPosts } from '../actions';
import { ActionsTrigger } from '../triggers'
import { defaultSelector } from '../selectors';


export class SchoolPage extends React.Component {

  static propTypes = {
    params: PropTypes.shape({
      school_name: PropTypes.string.isRequired
    }),
    school_posts: PropTypes.shape(
    ).isRequired
  };

  static async fetchData(params, store, client) {
    let school = client.schoolInfo(params.school_name);
    let posts = client.schoolPosts(params.school_name);

    try {
      school = await school;
    } catch (e) {
      store.dispatch(addSchool({url_name: params.school_name}));

      return 404;
    }

    store.dispatch(addSchool(school));
    store.dispatch(setSchoolPosts(school, await posts));
 }

  render() {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let followTriggers = {followTag: triggers.followSchool, unfollowTag: triggers.unfollowSchool};
    let school = _.find(this.props.schools, {url_name: this.props.params.school_name});

    if (!school) {
      return <script />; // not loaded yet
    }

    if (!school.id) {
      return <NotFound/>;
    }

    let schoolPosts = this.props.school_posts[school.id];
    let linesOfDescription = <p>No information provided...</p>;

    if (school.description) {
      linesOfDescription = school.description.split("\n").map((line, i) => <p key={`bio-${i}`}>{line}</p>);
    }

    return (
      <BaseSchoolPage
        current_user={this.props.current_user}
        page_school={school}
        is_logged_in={this.props.is_logged_in}
        followTriggers={followTriggers}
      >
        <div className="paper">
          <div className="paper__page content">
            {linesOfDescription}
          </div>
        </div>
        <div className="layout__row layout__row-double">
          <River
            current_user={this.props.current_user}
            posts={this.props.posts}
            river={schoolPosts}
            triggers={triggers}
            users={this.props.users}
          />
        </div>
      </BaseSchoolPage>
    )
  }
}

export default connect(defaultSelector)(SchoolPage);
