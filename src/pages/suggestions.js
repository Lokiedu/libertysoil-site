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
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import UserGrid from '../components/user-grid';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

import BaseSuggestionsPage from './base/suggestions';


const DiscoverGrid = ({ current_user, i_am_following, triggers, users }) => {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="paper__page">
      <h2 className="content__sub_title layout__row">People to follow</h2>
      <div className="layout__row layout__row-double">
        <UserGrid
          current_user={current_user}
          i_am_following={i_am_following}
          triggers={triggers}
          users={users}
        />
      </div>
    </div>
  );
};

DiscoverGrid.displayName = 'DiscoverGrid';

DiscoverGrid.propTypes = {
  current_user: CurrentUserPropType,
  i_am_following: ArrayOfUsersIdPropType,
  is_logged_in: PropTypes.bool.isRequired,
  triggers: PropTypes.shape({}),
  users: MapOfUsersPropType.isRequired
};

const SuggestionsPage = ({ current_user, dispatch, is_logged_in, following, messages }) => {
  if (!is_logged_in) {
    return false;
  }
  const i_am_following = following.get(current_user.get('id'));

  const client = new ApiClient(API_HOST);
  const triggers = new ActionsTrigger(client, dispatch);

  return (
    <BaseSuggestionsPage
      current_user={current_user}
      is_logged_in={is_logged_in}
      messages={messages}
      next_caption="Proceed to your feed"
      triggers={triggers}
    >
      <Helmet title="Suggested users at " />
      <div className="paper__page">
        <p>You are logged in. You can proceed to <Link className="link" to="/">your feed</Link>.</p>
      </div>

      <DiscoverGrid
        current_user={current_user}
        i_am_following={i_am_following}
        triggers={triggers}
        users={current_user.get('suggested_users')}
      />
    </BaseSuggestionsPage>
  );
};

SuggestionsPage.displayName = 'SuggestionsPage';

SuggestionsPage.propTypes = {
  current_user: CurrentUserPropType,
  dispatch: PropTypes.func,
  i_am_following: ArrayOfUsersIdPropType,
  is_logged_in: PropTypes.bool.isRequired,
  messages: ArrayOfMessagesPropType
};

SuggestionsPage.fetchData = async (params, store, client) => {
  const triggers = new ActionsTrigger(client, store.dispatch);
  const result = await triggers.loadPersonalizedSuggestions();

  if (!result) {
    return { status: 307, redirectTo: '/' };
  }

  return 200;
};

const selector = createSelector(
  currentUserSelector,
  state => state.get('following'),
  state => state.get('messages'),
  (current_user, following, messages) => ({
    following,
    messages,
    ...current_user
  })
);

export default connect(selector)(SuggestionsPage);
