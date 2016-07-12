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
import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';

import BaseSettingsPage from './base/settings';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';

import { RolesManager } from '../components/settings';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage';

  static propTypes = {
    messages: ArrayOfMessagesPropType
  };

  static async fetchData(params, store, client) {
    const props = store.getState();

    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    const currentUser = props.get('users').get(currentUserId);

    const userInfo = client.userInfo(currentUser.get('username'));
    store.dispatch(addUser(await userInfo));
  }

  constructor(props) {
    super(props);

    this.state = {
      processing: false
    };
  }

  onSave = async () => {
    this.setState({ processing: true });

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const roles = this.rolesManager._getRoles();
    const processedPictures = {};
    const pictures = this.base._getNewPictures();

    for (const name in pictures) {
      processedPictures[name] = await triggers.uploadPicture({ ...pictures[name] });
    }

    const result = await triggers.updateUserInfo({
      more: {
        summary: this.form.summary.value,
        bio: this.form.bio.value,
        roles,
        ...processedPictures
      }
    });

    if (result) {
      this.base._clearPreview();
    }

    this.setState({ processing: false });
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

    let roles = [];
    if (current_user.id && current_user.user.more && current_user.user.more.roles) {
      roles = current_user.user.more.roles;
    }

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
        onSave={this.onSave}
        processing={this.state.processing}
      >
        <Helmet title="Your Profile Settings on " />
        <form ref={c => this.form = c} className="paper__page">
          <h2 className="content__sub_title layout__row layout__row-small">Basic info</h2>
          <div className="layout__row">
            <label htmlFor="summary" className="layout__block layout__row layout__row-small">Summary</label>
            <input id="summary" name="summary" type="text" onChange={this.onChange} className="input input-block content layout__row layout__row-small" maxLength="100" defaultValue={current_user.user.more.summary} />
          </div>
          <div className="layout__row">
            <label htmlFor="bio" className="layout__block layout__row layout__row-small">Bio</label>
            <textarea id="bio" name="bio" onChange={this.onChange} className="input input-block input-textarea content layout__row layout__row-small" maxLength="5000" defaultValue={current_user.user.more.bio} />
          </div>
        </form>
        <div className="paper__page">
          <h2 className="content__sub_title layout__row">Roles</h2>
          <RolesManager
            ref={c => this.rolesManager = c}
            roles={roles}
          />
        </div>
      </BaseSettingsPage>
    );
  }
}

export default connect(defaultSelector)(SettingsPage);
