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

import BaseSettingsPage from './base/settings'

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore } from '../store';
import { addUser } from '../actions';
import { changePassword } from '../triggers'
import { defaultSelector } from '../selectors';

class SettingsPasswordPage extends React.Component {
  static displayName = 'SettingsPasswordPage'

  static async fetchData(params, props, client) {
    const currentUserId = props.get('current_user_id');

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
    this.refs.submit.click();
  }

  save = (e) => {
    e && e.preventDefault();

    let promise = changePassword(
      this.refs.form.currentPasssword.value,
      this.refs.form.newPasssword.value, this.refs.form.newPasssword2.value
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
        <form action="" ref="form" className="paper__page" onSubmit={this.save}>
          <h2 className="content__sub_title layout__row layout__row">Password</h2>

          <label htmlFor="currentPasssword" className="layout__row layout__row-small">Current password</label>
          <input name="currentPasssword" id="currentPasssword" className="input input-block layout__row layout__row-small" placeholder="secret" type="password" required />

          <label htmlFor="newPasssword" className="layout__row layout__row-small">New password</label>
          <input name="newPasssword" id="newPasssword" className="input input-block layout__row layout__row-small" placeholder="mystery" type="password" required />

          <label htmlFor="newPasssword2" className="layout__row layout__row-small">Repeat new password...</label>
          <input name="newPasssword2" id="newPasssword2" className="input input-block layout__row layout__row-small" placeholder="mystery" type="password" required />

          <input ref="submit" type="submit" className="hidden" />
        </form>

        {false && <div className="paper__page">
          <h2 className="content__title">Role</h2>
        </div>}
      </BaseSettingsPage>
    )
  }
}

export default connect(defaultSelector)(SettingsPasswordPage);
