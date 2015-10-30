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

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import {getStore, addSchool} from '../store';
//import {followSchool, unfollowSchool} from '../triggers'
import { defaultSelector } from '../selectors';

class SchoolPage extends React.Component {
  componentDidMount() {
    SchoolPage.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      let schoolInfo = client.schoolInfo(props.params.school_name);

      getStore().dispatch(addSchool(await schoolInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    let page_school = _.find(this.props.schools, {url_name: this.props.params.school_name});
    let linesOfDescription = <p>No information provided...</p>;

    if (_.isUndefined(page_school)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_school) {
      return <NotFound/>;
    }

    //let school_triggers = {followSchool, unfollowSchool};

    if (page_school.description) {
      linesOfDescription = page_school.description.split("\n").map((line, i) => <p key={`bio-${i}`}>{line}</p>);
    }

    return (
      <BaseSchoolPage
        current_user={this.props.current_user}
        page_school={page_school}
        is_logged_in={this.props.is_logged_in}
      >
        <div className="paper">
          <div className="paper__page content">
            {linesOfDescription}
          </div>
        </div>
      </BaseSchoolPage>
    )
  }
}

export default connect(defaultSelector)(SchoolPage);
