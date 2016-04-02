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
import Helmet from 'react-helmet';

import BaseSettingsPage from './base/settings'

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { addUser } from '../actions';
import { ActionsTrigger } from '../triggers'
import { defaultSelector } from '../selectors';

import { RolesManager } from '../components/settings';
import { ROLES } from '../consts/profileConstants';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage';

  constructor(props) {
    super(props);
    this.state = {
      roles: []
    };
  }

  componentWillMount () {
    const { current_user } = this.props;

    if (current_user.id && current_user.user.more && current_user.user.more.roles) {
      this.setState({
        roles: current_user.user.more.roles
      });
    }
  }

  static async fetchData(params, store, client) {
    const props = store.getState();

    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    let currentUser = props.get('users').get(currentUserId);

    let userInfo = client.userInfo(currentUser.get('username'));
    store.dispatch(addUser(await userInfo));
  }

  onChange = () => {

  };

  onSave = () => {
    let roles = this.state.roles;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.updateUserInfo({
      more: {
        summary: this.refs.form.summary.value,
        bio: this.refs.form.bio.value,
        roles: roles
      }
    });
  };

  addRole = () => {
    let roles = this.state.roles;

    roles.push([ROLES[0], '']);

    this.setState({ roles });
  };

  onRolesChange = (roles) => {
    this.setState({ roles });
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

    let roles = this.state.roles;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseSettingsPage
        current_user={current_user}
        followers={followers}
        following={following}
        is_logged_in={is_logged_in}
        messages={messages}
        triggers={triggers}
        onSave={this.onSave}
      >
        <Helmet title="Your Profile Settings on " />
        <form ref="form" className="paper__page">
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
            roles={roles}
            onAdd={this.addRole}
            onChange={this.onRolesChange}
            />
        </div>
      </BaseSettingsPage>
    )
  }
}

export default connect(defaultSelector)(SettingsPage);
