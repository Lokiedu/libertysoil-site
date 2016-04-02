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
import Helmet from 'react-helmet';

import BaseInductionPage from './base/induction';
import Footer from '../components/footer';
import Header from '../components/header';
import UserGrid from '../components/user-grid';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions';
import { ActionsTrigger } from '../triggers'
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

class InductionPage extends React.Component {
  static displayName = 'InductionPage';

  static async fetchData(params, store, client) {
    const state = store.getState();

    let currentUserId = state.getIn(['current_user', 'id']);
    let userInfo = await client.userInfo(state.getIn(['users', currentUserId, 'username']));
    store.dispatch(addUser(userInfo));

    let trigger = new ActionsTrigger(client, store.dispatch);
    const result = await trigger.loadInitialSuggestions();

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
      suggested_users,
      messages
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const doneInduction = () => {
      triggers.updateUserInfo({
        more: {
          first_login: false
        }
      });
    };

    if (!current_user.user.more.first_login) {
      return (
        <div>
          <Header is_logged_in={is_logged_in} current_user={current_user} />
          <div className="page__body">
            <InductionDone />
          </div>
          <Footer/>
        </div>
      );
    }

    return (
      <BaseInductionPage
        current_user={current_user}
        is_logged_in={is_logged_in}
        onNext={doneInduction}
        messages={messages}
        next_caption="Done"
        triggers={triggers}
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
              users={suggested_users}
            />
          </div>
        </div>
      </BaseInductionPage>
    )
  }
}

export default connect(defaultSelector)(InductionPage);
