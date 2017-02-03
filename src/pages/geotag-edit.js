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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Helmet from 'react-helmet';
import { browserHistory } from 'react-router';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import { MapOfGeotags as MapOfGeotagsPropType } from '../prop-types/geotags';
import { MapOfSchools as MapOfSchoolsPropType } from '../prop-types/schools';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';
import { createSelector, currentUserSelector } from '../selectors';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { addGeotag } from '../actions/geotags';
import { ActionsTrigger } from '../triggers';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import TagEditForm from '../components/tag-edit-form/tag-edit-form';
import { TAG_LOCATION } from '../consts/tags';

import BaseTagPage from './base/tag';
import NotFound from './not-found';

class GeotagEditPage extends React.Component {
  static displayName = 'GeotagEditPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    geotags: MapOfGeotagsPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    schools: MapOfSchoolsPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const geotag = client.getGeotag(router.params.url_name);

    try {
      store.dispatch(addGeotag(await geotag));
    } catch (e) {
      store.dispatch(addGeotag({ url_name: router.params.url_name }));

      return 404;
    }

    return 200;
  }

  constructor(props) {
    super(props);

    this.state = {
      processing: false
    };
  }

  saveGeotag = async (id, description) => {
    this.setState({ processing: true });

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const more = { description };

    try {
      const result = await triggers.updateGeotag(id, { more });
      browserHistory.push(getUrl(URL_NAMES.GEOTAG, { url_name: result.url_name }));
    } catch (e) {
      if (confirm("Saving changes failed. Would you like to try again?")) {
        this.saveGeotag(id, description);
        return;
      }
    }

    this.setState({ processing: false });
  };

  render() {
    const {
      is_logged_in,
      create_post_form,
      current_user,
      resetCreatePostForm,
      updateCreatePostForm,
      params,
      geotags,
      schools,
      messages
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

    return (
      <BaseTagPage
        editable
        params={params}
        current_user={current_user}
        tag={geotag}
        type={TAG_LOCATION}
        is_logged_in={is_logged_in}
        actions={actions}
        triggers={triggers}
        schools={schools.toList()}
        create_post_form={create_post_form}
      >
        <Helmet title={`${title} posts on `} />
        <div className="paper">
          <div className="paper__page">
            <TagEditForm
              tag={geotag}
              type={TAG_LOCATION}
              messages={messages}
              triggers={triggers}
              saveHandler={this.saveGeotag}
              processing={this.state.processing}
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
  state => state.get('geotags'),
  state => state.get('messages'),
  state => state.get('schools'),
  (current_user, create_post_form, geotags, messages, schools) => ({
    create_post_form,
    geotags,
    messages,
    schools,
    ...current_user
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(GeotagEditPage);
