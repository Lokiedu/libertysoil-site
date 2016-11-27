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

import {
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  MapOfUsers
} from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import { setConversationsRiver } from '../../actions/tools';
import { addUsers } from '../../actions/users';
import { getUrl } from '../../utils/urlGenerator';
import { URL_NAMES } from '../../config';

import Avatar from '../../components/user/avatar';
import Icon from '../../components/icon';


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
    store.dispatch(setConversationsRiver(users));
    store.dispatch(addUsers(users));
  }

  render() {
    const {
      conversations_river,
      users
    } = this.props;

    const followedUsers = conversations_river.map(id => users.get(id));
    const userItems = followedUsers.map((user, index) => (
      <div
        className="tools_item layout-align_justify"
        key={index}
      >
        <Link className="layout" to={getUrl(URL_NAMES.USER, { username: user.get('username') })}>
          <Avatar size={23} user={user} />
          <span className="tools_item__child-padded">{user.get('username')}</span>
        </Link>
        <Icon className="action" color="gray" icon="message" />
      </div>
    ));

    return (
      <div className="layout">
        <Helmet title="Followed people tool on " />
        <div className="tools_page__list_col">
          {userItems}
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.getIn(['tools', 'conversations_river']), // for the list of followed users
  state => state.get('users'),
  (conversations_river, users) => ({
    conversations_river,
    users
  })
);

export default connect(selector)(ConversationsToolPage);
