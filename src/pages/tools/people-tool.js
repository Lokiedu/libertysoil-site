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
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import {
  mapOf as mapOfPropType,
  uuid4 as uuid4PropType,
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  MapOfUsers
} from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { ActionsTrigger } from '../../triggers';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { setFollowedUsers } from '../../actions/tools';
import { addUsers } from '../../actions/users';
import UserDetails from '../../components/tools/user-details';
import UserList from '../../components/tools/user-list';

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


class PeopleToolPage extends React.Component {
  static displayName = 'PeopleToolPage';

  static propTypes = {
    current_user: ImmutablePropType(CurrentUserPropType).isRequired,
    dispatch: PropTypes.func.isRequired,
    followed_users: ImmutablePropType(ArrayOfUsersIdPropType).isRequired,
    following: ImmutablePropType(mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType)).isRequired,
    users: ImmutablePropType(MapOfUsers).isRequired,
  };

  static async fetchData(router, store, client) {
    const state = store.getState();
    const currentUserId = state.getIn(['current_user', 'id']);

    if (currentUserId === null) {
      return;
    }

    const users = await client.followedUsers(currentUserId);
    store.dispatch(setFollowedUsers(users));
    store.dispatch(addUsers(users));
  }

  state = {
    selectedUserId: null
  };

  handleSelectUser = (selectedUserId) => {
    this.setState({ selectedUserId });
  };

  render() {
    const {
      current_user,
      following,
      followed_users,
      users
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const followedUsers = followed_users.map(id => users.get(id));

    const selectedUserId = this.state.selectedUserId || followed_users.get(0);
    const selectedUser = users.get(selectedUserId);

    return (
      <div>
        <Helmet title="Followed people on " />
        <Header current_user={current_user} is_logged_in={!!current_user.get('id')}>
          <HeaderLogo />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <UserDetails
                  current_user={current_user}
                  following={following}
                  triggers={triggers}
                  user={selectedUser}
                />
              </PageContent>
              <SidebarAlt>
                <UserList
                  selectedUserId={selectedUserId}
                  users={followedUsers}
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
  state => state.get('following'), // to display the correct state of the "Follow" buttons
  state => state.getIn(['tools', 'followed_users']), // for the list of followed users
  state => state.get('users'),
  currentUserSelector,
  (following, followed_users, users, current_user) => ({
    following,
    followed_users,
    users,
    ...current_user
  })
);

export default connect(selector)(PeopleToolPage);
