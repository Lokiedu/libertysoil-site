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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import createSelector from '../../selectors/createSelector';
import { removeMessage } from '../../actions/messages';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';
import SettingsPasswordForm from '../../components/settings/password-form';
import Messages from '../../components/messages';

class PasswordToolPage extends React.Component {
  static displayName = 'PasswordToolPage';

  static propTypes = {
    actions: PropTypes.shape({
      removeMessage: PropTypes.func
    }),
    dispatch: PropTypes.func,
    messages: ArrayOfMessagesPropType
  };

  static async fetchData(router, store, client) {
    const currentUserId = store.getState().getIn(['current_user', 'id']);
    const currentUserUsername = store.getState().getIn(['users', currentUserId, 'username']);
    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.loadUserInfo(currentUserUsername);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const form = this.form.formProps();
    form.forceValidate();
    if (!form.isValid()) {
      return;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const fields = form.values();

    triggers.changePassword(
      fields.oldPassword,
      fields.newPassword,
      fields.newPasswordRepeat
    );
  };

  render() {
    return (
      <div>
        <Helmet title="Password tool on " />
        <SettingsPasswordForm
          ref={c => this.form = c}
          onSubmit={this.handleSubmit}
        />
        <div className="layout__row">
          <Messages
            messages={this.props.messages}
            removeMessage={this.props.actions.removeMessage}
          />
        </div>
      </div>
    );
  }
}

const inputSelector = createSelector(
  state => state.get('messages'),
  messages => ({ messages })
);

const outputSelector = dispatch => ({
  actions: { ...bindActionCreators({ removeMessage }, dispatch) }, dispatch
});

export default connect(inputSelector, outputSelector)(PasswordToolPage);
