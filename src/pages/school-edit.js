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
import { browserHistory } from 'react-router';
import Helmet from 'react-helmet';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import { MapOfSchools as MapOfSchoolsPropType } from '../prop-types/schools';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { addSchool } from '../actions/schools';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import TagEditForm from '../components/tag-edit-form/tag-edit-form';
import { TAG_SCHOOL } from '../consts/tags';

import BaseTagPage from './base/tag';
import NotFound from './not-found';


class SchoolEditPage extends React.Component {
  static displayName = 'SchoolEditPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    schools: MapOfSchoolsPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const school = client.getSchool(router.params.school_name);

    try {
      store.dispatch(addSchool(await school));
    } catch (e) {
      store.dispatch(addSchool({ url_name: router.params.school_name }));

      return 404;
    }

    const props = store.getState();
    const trigger = new ActionsTrigger(client, store.dispatch);

    if (props.get('geo').get('countries').size === 0) {
      await trigger.getCountries();
    }

    return 200;
  }

  constructor(props) {
    super(props);

    this.state = {
      processing: false
    };
  }

  saveSchool = async (id, properties) => {
    this.setState({ processing: true });

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const more = {};
    try {
      const pictures = this.base._getNewPictures();
      for (const name in pictures) {
        more[name] = await triggers.uploadPicture({ ...pictures[name] });
      }
    } catch (e) {
      if (!confirm("It seems like there're problems with upload the images. Would you like to continue saving changes without them?")) {
        this.setState({ processing: false });
        return;
      }
    }

    const schoolProperties = { ...properties, more };

    try {
      const result = await triggers.updateSchool(id, schoolProperties);
      browserHistory.push(getUrl(URL_NAMES.SCHOOL, { url_name: result.url_name }));
    } catch (e) {
      if (confirm("Saving changes failed. Would you like to try again?")) {
        this.saveSchool(id, properties);
        return;
      }
    }

    this.setState({ processing: false });
  };

  render() {
    const {
      create_post_form,
      geo,
      schools,
      current_user,
      is_logged_in,
      resetCreatePostForm,
      updateCreatePostForm,
      params,
      messages
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const school = schools.find(school => school.get('url_name') === this.props.params.school_name);
    const countries = geo.get('countries');

    if (!school) {
      return false;  // not loaded yet
    }

    if (!school.get('id')) {
      return <NotFound />;
    }

    return (
      <BaseTagPage
        ref={c => this.base = c}
        editable
        params={params}
        current_user={current_user}
        is_logged_in={is_logged_in}
        tag={school}
        type={TAG_SCHOOL}
        actions={actions}
        triggers={triggers}
        schools={schools}
        create_post_form={create_post_form}
      >
        <Helmet title={`Edit ${school.get('name')} on `} />
        <div className="paper">
          <div className="paper__page">
            <TagEditForm
              countries={countries}
              messages={messages}
              processing={this.state.processing}
              saveHandler={this.saveSchool}
              tag={school}
              triggers={triggers}
              type={TAG_SCHOOL}
            />
          </div>
        </div>
      </BaseTagPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('create_post_form'),
  state => state.get('geo'),
  state => state.get('messages'),
  state => state.get('schools'),
  (current_user, create_post_form, geo, messages, schools) => ({
    create_post_form,
    geo,
    messages,
    schools,
    ...current_user
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(SchoolEditPage);
