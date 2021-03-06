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
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Helmet from 'react-helmet';
import { browserHistory } from 'react-router';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import { MapOfHashtags as MapOfHashtagsPropType } from '../prop-types/hashtags';
import { MapOfSchools as MapOfSchoolsPropType } from '../prop-types/schools';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import { createSelector, currentUserSelector } from '../selectors';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { resetCreatePostForm, updateCreatePostForm } from '../actions/posts';
import { addHashtag } from '../actions/hashtags';
import { ActionsTrigger } from '../triggers';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import TagEditForm from '../components/tag-edit-form/tag-edit-form';
import { TAG_HASHTAG } from '../consts/tags';
import NotFound from '../pages/not-found';

import BaseTagPage from './base/tag';


class HashtagEditPage extends React.Component {
  static displayName = 'HashtagEditPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    hashtags: MapOfHashtagsPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    schools: MapOfSchoolsPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const hashtag = client.getHashtag(router.params.tag);

    try {
      store.dispatch(addHashtag(await hashtag));
    } catch (e) {
      store.dispatch(addHashtag({ name: router.params.tag }));

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

  saveHashtag = async (id, description) => {
    this.setState({ processing: true });

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const more = { description };

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

    try {
      const result = await triggers.updateHashtag(id, { more });
      browserHistory.push(getUrl(URL_NAMES.HASHTAG, { name: result.name }));
    } catch (e) {
      if (confirm("Saving changes failed. Would you like to try again?")) {
        this.saveHashtag(id, description);
        return;
      }
    }

    this.setState({ processing: false });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      create_post_form,
      resetCreatePostForm,
      updateCreatePostForm,
      params,
      hashtags,
      schools,
      messages,
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = { resetCreatePostForm, updateCreatePostForm };

    const tag = hashtags.get(params.tag);

    if (!tag) {
      return null;
    }

    if (!tag.get('id')) {
      return <NotFound />;
    }

    return (
      <BaseTagPage
        ref={c => this.base = c}
        editable
        params={params}
        current_user={current_user}
        tag={tag}
        type={TAG_HASHTAG}
        is_logged_in={is_logged_in}
        actions={actions}
        triggers={triggers}
        schools={schools.toList()}
        create_post_form={create_post_form}
      >
        <Helmet title={`"${tag.get('name')}" posts on `} />
        <div className="paper">
          <div className="paper__page">
            <TagEditForm
              tag={tag}
              type={TAG_HASHTAG}
              messages={messages}
              triggers={triggers}
              saveHandler={this.saveHashtag}
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
  state => state.get('hashtags'),
  state => state.get('messages'),
  state => state.get('schools'),
  (current_user, create_post_form, hashtags, messages, schools) => ({
    create_post_form,
    hashtags,
    messages,
    schools,
    ...current_user
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(HashtagEditPage);
