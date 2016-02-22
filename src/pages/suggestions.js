/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import { Link } from 'react-router';

import BaseSuggestionsPage from './base/suggestions';
import { UserGrid } from '../components/user-grid';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { ActionsTrigger } from '../triggers'
import { defaultSelector } from '../selectors';


const DiscoverGrid = (props) => {
  if (props.users.length === 0) {
    return <script/>;
  }

  return (
    <div className="paper__page">
      <h2 className="content__sub_title layout__row">People to follow</h2>
      <div className="layout__row layout__row-double">
        <UserGrid
          current_user={props.current_user}
          i_am_following={props.i_am_following}
          triggers={props.triggers}
          users={props.users}
        />
      </div>
    </div>
  );
};

class SuggestionsPage extends React.Component {
  static async fetchData(params, store, client) {
    let triggers = new ActionsTrigger(client, store.dispatch);
    const result = await triggers.loadPersonalizedSuggestions()

    if (!result) {
      return {status: 307, redirectTo: '/'};
    }

    return 200;
  }

  render() {
    const {
      current_user,
      is_logged_in,
      i_am_following,
      messages
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseSuggestionsPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        messages={messages}
        next_caption="Proceed to your feed"
        triggers={triggers}
      >
        <div className="paper__page">
          <p>You are logged in. You can proceed to <Link className="link" to="/">your feed</Link>.</p>
        </div>

        <DiscoverGrid
          current_user={current_user}
          i_am_following={i_am_following}
          triggers={triggers}
          users={current_user.suggested_users}
        />
      </BaseSuggestionsPage>
    )
  }
}

export default connect(defaultSelector)(SuggestionsPage);
