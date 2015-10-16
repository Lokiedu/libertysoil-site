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
import { getStore, addUser } from '../store';
import { followUser, unfollowUser } from '../triggers'
import { defaultSelector } from '../selectors';

class SettingsPasswordPage extends React.Component {
  static displayName = 'SettingsPasswordPage'

  componentDidMount () {
    SettingsPasswordPage.fetchData(this.props);
  }

  static async fetchData (props) {
    let client = new ApiClient(API_HOST);

    if (!props.current_user) {
      return;
    }

    try {
      let userInfo = client.userInfo(props.current_user.username);
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

    console.info('Save...', {
      currentPasssword: this.refs.form.currentPasssword.value,
      newPassord: this.refs.form.newPasssword.value,
      newPassord2: this.refs.form.newPasssword2.value
    });
  }

  render() {
    const {
      current_user,
      is_logged_in,
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
      >
        <form action="" ref="form" className="paper__page" onSubmit={this.save}>
          <h2 className="content__sub_title layout__row layout__row">Password</h2>
          <label htmlFor="currentPasssword" className="layout__row layout__row-small">Current password</label>
          <input name="currentPasssword" id="currentPasssword" className="input input-block layout__row layout__row-small" placeholder="Current password..." type="password" required />
          <label htmlFor="newPasssword" className="layout__row layout__row-small">New password</label>
          <input name="newPasssword" id="newPasssword" className="input input-block layout__row layout__row-small" placeholder="New password..." type="password" required />
          <label htmlFor="newPasssword2" className="layout__row layout__row-small">Repeat mew password...</label>
          <input name="newPasssword2" id="newPasssword2" className="input input-block layout__row layout__row-small" placeholder="Repeat mew password..." type="password" required />
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
