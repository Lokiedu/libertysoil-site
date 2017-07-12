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
import { Link } from 'react-router';
import i from 'immutable';

import ApiClient from '../../api/client';
import { ActionsTrigger } from '../../triggers';
import {
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  MapOfUsers
} from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { setConversationsRiver } from '../../actions/tools';
import { addUsers } from '../../actions/users';
import { getUrl } from '../../utils/urlGenerator';
import { API_HOST, URL_NAMES } from '../../config';

import Avatar from '../../components/user/avatar';
import { OldIcon as Icon } from '../../components/icon';
import Conversation from '../../components/tools/conversation';

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


class ConversationsToolPage extends React.Component {
  static displayName = 'ConversationsToolPage';

  static propTypes = {
    conversations_river: ImmutablePropType(ArrayOfUsersIdPropType).isRequired,
    users: ImmutablePropType(MapOfUsers).isRequired,
  };

  static async fetchData(router, store, client) {
    const state = store.getState();
    const currentUserId = state.getIn(['current_user', 'id']);

    if (currentUserId === null) {
      return;
    }

    const users = await client.mutualFollows(currentUserId);
    if (users.length > 0) {
      store.dispatch(setConversationsRiver(users));
      store.dispatch(addUsers(users));

      const triggers = new ActionsTrigger(client, store.dispatch);
      const firstUserId = users[0].id;
      await triggers.updateUserMessages(firstUserId);
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
    const firstUser = this.props.conversations_river.first();
    this.setState({ selectedUserId: firstUser });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.selectedUserId) {
      const firstUser = nextProps.conversations_river.first();
      this.setState({ selectedUserId: firstUser });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeoutId);
  }

  handleSelectUser = async (selectedUserId) => {
    this.setState({ selectedUserId });
    await this.updateMessages(selectedUserId);
  };

  handleSendMessage = async (userId, text) => {
    this.triggers.sendMessage(userId, text);
  };

  updateMessages = async (selectedUserId) => {
    clearTimeout(this.timeoutId);

    if (selectedUserId) {
      await this.triggers.updateUserMessages(selectedUserId);

      this.timeoutId = setTimeout(this.updateMessages.bind(this, selectedUserId), 30 * 1000);
    }
  }

  render() {
    const {
      current_user,
      conversations_river,
      users,
      user_messages
    } = this.props;

    const currentUser = users.get(current_user.get('id'));
    const selectedUser = users.get(this.state.selectedUserId);
    const selectedUserMessages = user_messages.get(this.state.selectedUserId) || i.List();


    const followedUsers = conversations_river.map(id => users.get(id));
    const userItems = followedUsers.map((user, index) => {
      const handleClick = () => this.handleSelectUser(user.get('id'));
      const isSelected = this.state.selectedUserId === user.get('id');
      let className = 'tools_item layout-align_justify';
      if (isSelected) {
        className += ' tools_item-selected';
      }

      return (
        <div
          className={className}
          key={index}
        >
          <Link className="layout" to={getUrl(URL_NAMES.USER, { username: user.get('username') })}>
            <Avatar size={23} user={user} />
            <span className="tools_item__child-padded">{user.get('username')}</span>
          </Link>
          <Icon
            className="tools_item__icon action"
            icon="message"
            onClick={handleClick}
          />
        </div>
      );
    });

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
                <Conversation
                  currentUser={currentUser}
                  messages={selectedUserMessages}
                  selectedUser={selectedUser}
                  onSend={this.handleSendMessage}
                />
              </PageContent>
              <SidebarAlt>
                {userItems}
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
  state => state.getIn(['tools', 'conversations_river']),
  state => state.get('users'),
  state => state.get('user_messages'),
  (current_user, conversations_river, users, user_messages) => ({
    ...current_user,
    conversations_river,
    users,
    user_messages
  })
);

export default connect(selector)(ConversationsToolPage);
