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
import _ from 'lodash';
import Helmet from 'react-helmet';

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
import { defaultSelector } from '../selectors';

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
      i_am_following,
      is_logged_in,
      params,
      users
    } = this.props;

    const page_user = _.find(users, { username: params.username });
    if (_.isUndefined(page_user)) {
      return null;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound />;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let linesOfBio = <p>No information provided...</p>;
    if (page_user.more) {
      if (page_user.more.bio) {
        linesOfBio = page_user.more.bio.split("\n").map((line, i) => <p key={`bio-${i}`}>{line}</p>);
      }
    }

    return (
      <BaseUserPage
        current_user={current_user}
        i_am_following={i_am_following}
        is_logged_in={is_logged_in}
        page_user={page_user}
        triggers={triggers}
      >
        <Helmet title={`${page_user.fullName} on `} />
        <div className="paper">
          <div className="paper__page content">
            {linesOfBio}
          </div>
        </div>
      </BaseUserPage>
    );
  }
}

export default connect(defaultSelector)(AboutUserPage);
