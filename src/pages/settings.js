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
import Helmet from 'react-helmet';
import i from 'immutable';

import {
  mapOf as mapOfPropType,
  uuid4 as uuid4PropType
} from '../prop-types/common';
import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import BaseSettingsPage from './base/settings';
import BasicInfoForm from '../components/settings/basic-info-form';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { Command } from '../utils/command';
import { addUser } from '../actions/users';
import { addError } from '../actions/messages';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

import { RolesManager } from '../components/settings';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    followers: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    following: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType).isRequired,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const props = store.getState();

    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    const currentUser = props.get('users').get(currentUserId);

    const userInfo = client.userInfo(currentUser.get('username'));
    store.dispatch(addUser(await userInfo));
  }

  handleChange = (command) => {
    if (this.base) {
      this.base.handleChange(command);
    }
  };

  // BasicInfoForm uses react-inform's onChange that can't generate Command independently
  handleFormChange = () => {
    const command = new Command('basic-info-form', this.handleSave);
    this.handleChange(command);
  };

  handleSave = async () => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const formValues = this.form.formProps().values();

    let success;
    try {
      success = await triggers.updateUserInfo({
        more: {
          bio: formValues.bio,
          summary: formValues.summary
        }
      });
    } catch (e) {
      success = false;
      this.handleError(e.message);
    }

    return { success };
  };

  handleError = (e) => {
    this.props.dispatch(addError(e.message));
  };

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      followers
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    const roles = current_user.getIn(['user', 'more', 'roles'], i.List()).toJS();

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseSettingsPage
        ref={c => this.base = c}
        current_user={current_user}
        followers={followers}
        following={following}
        is_logged_in={is_logged_in}
        messages={messages}
        triggers={triggers}
        onSave={this.handleSave}
      >
        <Helmet title="Your Profile Settings on " />
        <BasicInfoForm
          current_user={current_user}
          ref={c => this.form = c}
          onChange={this.handleFormChange}
        />
        <div className="paper__page">
          <h2 className="content__sub_title layout__row">Roles</h2>
          <RolesManager
            roles={roles}
            onChange={this.handleChange}
            onError={this.handleError}
            onSave={triggers.updateUserInfo}
          />
        </div>
      </BaseSettingsPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('messages'),
  state => state.get('following'),
  state => state.get('followers'),
  (current_user, messages, following, followers) => ({
    messages,
    following,
    followers,
    ...current_user
  })
);

export default connect(selector)(SettingsPage);
