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
import i from 'immutable';

import { url as urlPropType } from '../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import NotFound from './not-found';
import BaseUserPage from './base/user';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

class AboutUserPage extends React.Component {
  static displayName = 'AboutUserPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    i_am_following: ArrayOfUsersIdPropType,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      username: urlPropType.isRequired
    }).isRequired,
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    const userInfo = client.userInfo(router.params.username);
    store.dispatch(addUser(await userInfo));
  }

  render() {
    const {
      current_user,
      following,
      is_logged_in,
      params,
      users
    } = this.props;

    const i_am_following = following.get(current_user.get('id'));
    const user = users.find(user => user.get('username') === params.username);

    if (!user) {
      return null;  // not loaded yet
    }

    if (!user.get('id')) {
      return <NotFound />;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let linesOfBio = <p>No information provided...</p>;
    if (user.getIn(['more', 'bio'])) {
      linesOfBio = user.getIn(['more', 'bio']).split('\n').map((line, i) => <p key={`bio-${i}`}>{line}</p>);
    }

    return (
      <BaseUserPage
        current_user={current_user}
        followers={i.Map()}
        following={following}
        i_am_following={i_am_following}
        is_logged_in={is_logged_in}
        triggers={triggers}
        user={user}
      >
        <Helmet title={`${user.get('fullName')} on `} />
        <div className="paper">
          <div className="paper__page content">
            {linesOfBio}
          </div>
        </div>
      </BaseUserPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('following'),
  state => state.get('users'),
  (current_user, following, users) => ({
    following,
    users,
    ...current_user
  })
);

export default connect(selector)(AboutUserPage);
