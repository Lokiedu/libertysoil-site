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
import { browserHistory } from 'react-router'
import _ from 'lodash';
import Helmet from 'react-helmet';

import {API_HOST} from '../config';
import ApiClient from '../api/client'
import BaseSchoolPage from './base/school'
import {
  addSchool,
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions';
import { ActionsTrigger } from '../triggers'
import { defaultSelector } from '../selectors';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import SchoolEditForm from '../components/school-edit-form';
import NotFound from './not-found';


class SchoolEditPage extends React.Component {
  static async fetchData(params, store, client) {
    let school = client.getSchool(params.school_name);

    try {
      store.dispatch(addSchool(await school));
    } catch (e) {
      store.dispatch(addSchool({url_name: params.school_name}));

      return 404;
    }

    const trigger = new ActionsTrigger(client, store.dispatch);
    await Promise.all([
      trigger.loadSchools()
    ]);

    return 200;
  }

  saveSchool = (id, name, description, lat, lon) => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.updateSchool(id, { name, description, lat, lon })
      .then((result) => {
        browserHistory.push(getUrl(URL_NAMES.SCHOOL, {url_name: result.url_name}));
      }).catch(() => {
        // do nothing. redux has an error already
      });
  };

  render() {
    const { schools } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = {resetCreatePostForm, updateCreatePostForm};

    let school = _.find(schools, {url_name: this.props.params.school_name});

    if (!school) {
      return false;  // not loaded yet
    }

    if (!school.id) {
      return <NotFound/>;
    }

    return (
      <BaseSchoolPage
        current_user={this.props.current_user}
        is_logged_in={this.props.is_logged_in}
        page_school={school}
        actions={actions}
        triggers={triggers}
        schools={schools}
      >
        <Helmet title={`Edit ${school.name} on `} />
        <div className="paper">
          <div className="paper__page">
            <SchoolEditForm saveSchoolHandler={this.saveSchool} school={school} />
          </div>
        </div>
      </BaseSchoolPage>
    );
  }
}

export default connect(defaultSelector)(SchoolEditPage);
