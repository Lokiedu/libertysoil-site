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

import BaseInductionPage from './base/induction';
import User from '../components/user';
import FollowButton from '../components/follow-button';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { getStore } from '../store';
import { addUser } from '../actions';
import { followUser, unfollowUser, doneInduction } from '../triggers'
import { defaultSelector } from '../selectors';

let InductionDone = () => (
  <div className="area">
    <div className="area__body">
      <div className="message">
        <div className="message__body">
          You are done! You can proceed to <Link className="link" to="/">your feed</Link>.
        </div>
      </div>
    </div>
  </div>
);

export default class UserGrid extends React.Component {
  static displayName = 'UserGrid'

  render () {
    const {
      users,
      current_user,
      i_am_following,
      triggers
    } = this.props;

    if (!users) {
      return false;
    }

    return (
      <div className="layout__grids layout__grids-space layout__grid-responsive">
        {users.map((user) => (
          <div className="layout__grids_item layout__grids_item-space layout__grid_item-50" key={`user-${user.id}`}>
            <div className="layout__row layout__row-small">
              <User
                user={user}
                avatarSize="32"
              />
            </div>

            <div className="layout__row layout__row-small">
              <FollowButton
                active_user={current_user}
                following={i_am_following}
                triggers={triggers}
                user={user}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
};

class InductionPage extends React.Component {
  static displayName = 'SettingsPasswordPage'

  static async fetchData(params, props, client) {
    if (props.get('current_user').get('id') === null) {
      return false;
    }

    try {
      let suggestedUsers = await client.initialSuggestions();

      let userInfo = await client.userInfo(props.users[props.current_user.id].username);
      userInfo.more.suggested_users = suggestedUsers;

      getStore().dispatch(addUser(userInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    const {
      current_user,
      is_logged_in,
      i_am_following,
      messages,
      on_complete,
      ...props
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <BaseInductionPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        onNext={on_complete}
        messages={messages}
        next_caption="Done"
      >
        <div className="paper__page">
          <h1 className="content__title">Thank you for registering!</h1>
          <p>In order to help you get started we&#39;ve curated a list of peers you might want to follow, be sure to check them out.</p>
        </div>

        <div className="paper__page">
          <h2 className="content__sub_title layout__row">Suggested peers</h2>
          <div className="layout__row layout__row-double">
            <UserGrid
              current_user={current_user}
              i_am_following={i_am_following}
              triggers={{followUser, unfollowUser}}
              users={current_user.more.suggested_users}
            />
          </div>
        </div>
      </BaseInductionPage>
    )
  }
}

export default connect(defaultSelector)(InductionPage);
