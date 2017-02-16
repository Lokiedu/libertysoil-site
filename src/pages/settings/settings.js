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
  CurrentUser as CurrentUserPropType
} from '../../prop-types/users';

import BasicInfoForm from '../../components/settings/basic-info-form';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { addUser } from '../../actions/users';
import { addError } from '../../actions/messages';
import { ActionsTrigger } from '../../triggers';
import { createSelector, currentUserSelector } from '../../selectors';

import Button from '../../components/button';
import ProfileHeader from '../../components/profile';

class SettingsPage extends React.Component {
  static displayName = 'SettingsPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
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

  constructor(props) {
    super(props);

    this.state = {
      unsaved: false,
      processing: false
    };

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
  }

  handleSave = async () => {
    this.setState({ processing: true });

    const formValues = this.form.formProps().values();
    const roles = this.roles.getRoles();

    let success;
    try {
      success = await this.triggers.updateUserInfo({
        more: {
          bio: formValues.bio,
          summary: formValues.summary,
          roles
        }
      });

      // Save pictures
      success = success && await this.head.saveAll();
    } catch (e) {
      success = false;
      this.handleError(e.message);
    }

    this.setState({ processing: false, unsaved: !success });

    return { success };
  };

  handleFormChange = () => {
    // FIXME: react-inform calls onChange upon initialization.
    this.setState({ unsaved: true });
  }

  handleError = (e) => {
    this.props.dispatch(addError(e.message));
  };

  // TODO: Make ProfileHeader, BasicInfoForm, and RolesManager managed instead of using refs.
  render() {
    const {
      current_user,
      is_logged_in,
      following,
      followers
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <div>
        <Helmet title="Your Profile Settings on " />
        <ProfileHeader
          current_user={current_user}
          editable
          followers={followers}
          following={following}
          onChange={this.handleFormChange}
          ref={c => this.head = c}
          triggers={this.triggers}
          user={current_user.get('user')}
        />
        <BasicInfoForm
          current_user={current_user}
          ref={c => this.form = c}
          onChange={this.handleFormChange}
        />
        {this.state.unsaved &&
          <div className="paper__page layout__raw_grid layout__raw_grid--reverse tools_page__item--flex">
            <Button
              className="button button-wide button-green button--new"
              title="Save changes"
              waiting={this.state.processing}
              onClick={this.handleSave}
            />
          </div>
        }
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('following'),
  state => state.get('followers'),
  (current_user, following, followers) => ({
    ...current_user,
    following,
    followers
  })
);

export default connect(selector)(SettingsPage);
