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
import { debounce } from 'lodash';
import zxcvbn from 'zxcvbn';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { addMessage, removeMessage } from '../../actions/messages';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';
import SettingsPasswordForm from '../../components/settings/password-form';
import Messages from '../../components/messages';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import SidebarAlt from '../../components/sidebarAlt';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import Sidebar from '../../components/sidebar';


const WEAK_PASSWORD_MESSAGE = 'Password is weak. Consider adding more words or symbols';

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

  handleChange = debounce(values => {
    if (values.newPassword) {
      if (zxcvbn(values.newPassword).score <= 1) {
        this.props.actions.addMessage(WEAK_PASSWORD_MESSAGE);
        return;
      }
    }

    const index = this.props.messages.findIndex(item =>
      item.get('message') === WEAK_PASSWORD_MESSAGE
    );
    if (index >= 0) {
      this.props.actions.removeMessage(index);
    }
  }, 300);

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
    const {
      current_user
    } = this.props;

    return (
      <div>
        <Helmet title="Password tool on " />
        <Header current_user={current_user} is_logged_in={!!current_user.get('id')}>
          <HeaderLogo small />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <SettingsPasswordForm
                  ref={c => this.form = c}
                  onChange={this.handleChange}
                  onSubmit={this.handleSubmit}
                />
                <div className="layout__row">
                  <Messages
                    messages={this.props.messages}
                    removeMessage={this.props.actions.removeMessage}
                  />
                </div>
              </PageContent>
              <SidebarAlt />
            </PageBody>
          </PageMain>
        </Page>
        <Footer />
      </div>
    );
  }
}

const inputSelector = createSelector(
  currentUserSelector,
  state => state.get('messages'),
  (current_user, messages) => ({
    ...current_user,
    messages
  })
);

const outputSelector = dispatch => ({
  actions: {
    ...bindActionCreators({ addMessage, removeMessage }, dispatch)
  },
  dispatch
});

export default connect(inputSelector, outputSelector)(PasswordToolPage);
