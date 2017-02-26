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
import i from 'immutable';

import ApiClient from '../api/client';
import { ActionsTrigger } from '../triggers';
import createSelector from '../selectors/createSelector';
import currentUserSelector from '../selectors/currentUser';
import { API_HOST } from '../config';

import Conversation from '../components/conversations/conversation';
import UserList from '../components/conversations/user-list';
import { UserCaption } from '../components/page/captions';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import SidebarAlt from '../components/sidebarAlt';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar';
import RiverItemCreateForm from '../components/river/type/text/create-form';
import User from '../components/user';


class ConversationsPage extends React.Component {
  static async fetchData(router, store, client) {
    const state = store.getState();
    const currentUserId = state.getIn(['current_user', 'id']);

    if (currentUserId === null) {
      return;
    }

    const triggers = new ActionsTrigger(client, store.dispatch);
    const users = await triggers.loadMessageableUsers(currentUserId);

    if (users.length > 0) {
      const firstUserId = users[0].id;
      await triggers.loadUserMessages(firstUserId, { visit: true });
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedUserId: null
    };

    this.client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(this.client, this.props.dispatch);
  }

  componentWillMount() {
    const firstUser = this.props.user_messages.get('messageableUserIds').first();
    this.setState({ selectedUserId: firstUser });
  }

  componentDidMount() {
    if (!this.state.selectedUserId) {
      return;
    }

    this.setMessagesInterval(this.state.selectedUserId);
  }

  componentWillReceiveProps(nextProps) {
    // Select the first user in the list if no user is selected (e.g. when ac)
    if (!this.state.selectedUserId) {
      const firstUser = nextProps.user_messages.get('messageableUserIds').first();
      this.setState({ selectedUserId: firstUser });
    }
  }

  componentWillUnmount() {
    clearInterval(this.messageIntervalId);
  }

  handleSelectUser = async (selectedUserId) => {
    this.triggers.loadUserMessagesStatus();
    await this.triggers.loadUserMessages(selectedUserId, { visit: true });
    this.setMessagesInterval(selectedUserId);
    this.setState({ selectedUserId });
  };

  handleSendMessage = async (text) => {
    return await this.triggers.sendUserMessage(this.state.selectedUserId, text);
  };

  handleUpdateMessage = async (messageId, text) => {
    return await this.triggers.updateUserMessage(this.state.selectedUserId, messageId, text);
  };

  handleDeleteMessage = async (message) => {
    this.triggers.deleteUserMessage(message.get('receiver_id'), message.get('id'));
  };

  setMessagesInterval = (selectedUserId) => {
    clearInterval(this.messageIntervalId);

    this.messageIntervalId = setInterval(() => {
      this.triggers.loadUserMessages(selectedUserId);
    }, 20 * 1000);
  }

  render() {
    const {
      current_user,
      users,
      user_messages
    } = this.props;

    const currentUser = users.get(current_user.get('id'));
    const selectedUser = users.get(this.state.selectedUserId);
    const selectedUserMessages = user_messages.getIn(['byUser', this.state.selectedUserId, 'messages']) || i.List();

    return (
      <div>
        <Helmet title="Conversations on " />
        <Header current_user={current_user} is_logged_in={!!current_user.get('id')}>
          <HeaderLogo />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <UserCaption user={selectedUser} />
                <Conversation
                  current_user={current_user}
                  messages={selectedUserMessages}
                  users={users}
                  onUpdate={this.handleUpdateMessage}
                  onDelete={this.handleDeleteMessage}
                />
                <div className="bio__river-item bio__river-item--type_form">
                  <RiverItemCreateForm
                    cancel={{ hide: true }}
                    className="bio__create-post-form"
                    icon={
                      <div className="bio__icon">
                        <User
                          avatar={{ isRound: false, size: 26 }}
                          text={{ hide: true }}
                          user={currentUser}
                        />
                      </div>
                    }
                    input={{
                      className: 'bio__post--type_text',
                      placeholder: ''
                    }}
                    submit={{
                      className: 'button-wide bio__button',
                      color: 'dark_blue',
                      title: 'Post'
                    }}
                    onSubmit={this.handleSendMessage}
                  />
                </div>
              </PageContent>
              <SidebarAlt>
                <UserList
                  selectedUserId={this.state.selectedUserId}
                  user_messages={user_messages}
                  users={users}
                  onClick={this.handleSelectUser}
                />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>
        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('users'),
  state => state.get('user_messages'),
  (current_user, users, user_messages) => ({
    ...current_user,
    users,
    user_messages
  })
);

export default connect(selector)(ConversationsPage);
