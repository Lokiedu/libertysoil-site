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
import SettingsPasswordForm from '../components/settings/password-form';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { Command } from '../utils/command';
import { addError } from '../actions/messages';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

class SettingsPasswordPage extends React.Component {
  static displayName = 'SettingsPasswordPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    dispatch: PropTypes.func.isRequired,
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

  handleChange = (values) => {
    if (this.base) {
      const command = new Command(
        'password-form',
        this.handleSave,
        { status: !!Object.keys(values).length }
      );

      this.base.handleChange(command);
    }
  };

  handleSave = async () => {
    let success = false;

    const form = this.form.formProps();
    form.forceValidate();
    if (!form.isValid()) {
      return { success };
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const fields = form.values();

    const result = await triggers.changePassword(
      fields.oldPassword,
      fields.newPassword,
      fields.newPasswordRepeat
    );

    if (result.success) {
      form.onValues({});
      success = true;
    } else if (result.error) {
      this.props.dispatch(addError(result.error));
      success = false;
    }

    return { success };
  };

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      followers
    } = this.props;

    const current_user_js = current_user.toJS(); // FIXME #662
    const messages_js = messages.toJS(); // FIXME #662
    const following_js = following.toJS(); // FIXME #662
    const followers_js = followers.toJS(); // FIXME #662

    if (!is_logged_in) {
      return false;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseSettingsPage
        current_user={current_user_js}
        followers={followers_js}
        following={following_js}
        is_logged_in={is_logged_in}
        messages={messages_js}
        ref={c => this.base = c}
        triggers={triggers}
        onSave={this.handleSave}
      >
        <Helmet title="Change Password for " />
        <SettingsPasswordForm
          ref={c => this.form = c}
          onChange={this.handleChange}
        />

        {false &&
          <div className="paper__page">
            <h2 className="content__title">Role</h2>
          </div>
        }
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

export default connect(selector)(SettingsPasswordPage);
