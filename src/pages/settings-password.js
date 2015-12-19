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
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import BaseSettingsPage from './base/settings'
import SettingsPasswordForm from '../components/settings/password-form';
import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore } from '../store';
import { addUser } from '../actions';
import { changePassword } from '../triggers'
import { defaultSelector } from '../selectors';

class SettingsPasswordPage extends React.Component {
  static displayName = 'SettingsPasswordPage'

  static async fetchData(params, props, client) {
    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    let currentUser = props.get('users').get(currentUserId);

    try {
      let userInfo = client.userInfo(currentUser.get('username'));
      getStore().dispatch(addUser(await userInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  onSave = () => {
    let event = document.createEvent("HTMLEvents");
    event.initEvent('submit', true, true);
    event.eventType = 'submit';

    this.form.dispatchEvent(event);
  };

  save = (e) => {
    e && e.preventDefault();

    let promise = changePassword(
      this.form.old_password.value,
      this.form.new_password.value,
      this.form.new_password_repeat.value
    );

    promise.catch(e => {
      console.log(e);
      console.log(e.stack);
    })
  };

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      followers,
      ...props
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <BaseSettingsPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        onSave={this.onSave}
        messages={messages}
        following={following}
        followers={followers}
      >
        <SettingsPasswordForm
          onSubmit={this.save}
          ref={c => this.form = ReactDOM.findDOMNode(c)}
        />

        {false && <div className="paper__page">
          <h2 className="content__title">Role</h2>
        </div>}
      </BaseSettingsPage>
    )
  }
}

export default connect(defaultSelector)(SettingsPasswordPage);
