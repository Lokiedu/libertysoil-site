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
  ArrayOfUsers as ArrayOfUsersPropType,
  CurrentUser as CurrentUserPropType
} from '../prop-types/users';

import Footer from '../components/footer';
import Header from '../components/header';
import UserGrid from '../components/user-grid';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';

import BaseInductionPage from './base/induction';


const InductionDone = () => (
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

class InductionPage extends React.Component {
  static displayName = 'InductionPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    dispatch: PropTypes.func,
    is_logged_in: PropTypes.bool.isRequired,
    messages: ArrayOfMessagesPropType,
    suggested_users: ArrayOfUsersPropType
  };

  static async fetchData(router, store, client) {
    const state = store.getState();

    const currentUserId = state.getIn(['current_user', 'id']);
    const userInfo = await client.userInfo(state.getIn(['users', currentUserId, 'username']));
    store.dispatch(addUser(userInfo));

    const trigger = new ActionsTrigger(client, store.dispatch);
    const result = await trigger.loadInitialSuggestions();

    if (!result) {
      return { status: 307, redirectTo: '/' };
    }

    return 200;
  }

  doneInduction = () => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    triggers.updateUserInfo({
      more: {
        first_login: false
      }
    });
  };

  render() {
    const {
      current_user,
      is_logged_in,
      suggested_users,
      messages,
      following,
      users
    } = this.props;

    const i_am_following = following.get(current_user.get('id'));

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    if (!current_user.getIn(['user', 'more', 'first_login'])) {
      return (
        <div>
          <Header current_user={current_user} is_logged_in={is_logged_in} />
          <div className="page__body">
            <InductionDone />
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <BaseInductionPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        messages={messages}
        next_caption="Done"
        triggers={triggers}
        onNext={this.doneInduction}
      >
        <Helmet title="Suggested users at " />
        <div className="paper__page">
          <div className="content">
            <h1 className="content__title">Thank you for registering!</h1>
            <p>To get started, follow a few people below:</p>
          </div>
        </div>

        <div className="paper__page">
          <h2 className="content__sub_title layout__row">People to follow</h2>
          <div className="layout__row layout__row-double">
            <UserGrid
              current_user={current_user}
              i_am_following={i_am_following}
              triggers={triggers}
              users={suggested_users.map(id => users.get(id))}
            />
          </div>
        </div>
      </BaseInductionPage>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('following'),
  state => state.get('messages'),
  state => state.get('suggested_users'),
  state => state.get('users'),
  (current_user, following, messages, suggested_users, users) => ({
    following,
    messages,
    suggested_users,
    users,
    ...current_user
  })
);

export default connect(selector)(InductionPage);
