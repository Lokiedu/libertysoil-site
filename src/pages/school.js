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
import { connect } from 'react-redux';
import _ from 'lodash';

import NotFound from './not-found'
import BaseSchoolPage from './base/school'
import River from '../components/river_of_posts';

import { getStore } from '../store';
import { addSchool, setSchoolPosts } from '../actions';
import { likePost, unlikePost, favPost, unfavPost, followSchool, unfollowSchool } from '../triggers'
import { defaultSelector } from '../selectors';

class SchoolPage extends React.Component {
  static async fetchData(params, props, client) {
    try {
      let schoolInfo = await client.schoolInfo(params.school_name);
      let posts = await client.schoolPosts(params.school_name);

      getStore().dispatch(addSchool(schoolInfo));
      getStore().dispatch(setSchoolPosts(schoolInfo, posts));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    let postTriggers = {likePost, unlikePost, favPost, unfavPost};
    let followTriggers = {followTag: followSchool, unfollowTag: unfollowSchool};
    let school = _.find(this.props.schools, {url_name: this.props.params.school_name});
    let schoolPosts = this.props.school_posts[school.id];
    let linesOfDescription = <p>No information provided...</p>;

    if (_.isUndefined(school)) {
      return <script/>;  // not loaded yet
    }

    if (false === school) {
      return <NotFound/>;
    }

    //let school_triggers = {followSchool, unfollowSchool};

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
            triggers={postTriggers}
            users={this.props.users}
          />
        </div>
      </BaseSchoolPage>
    )
  }
}

export default connect(defaultSelector)(SchoolPage);
