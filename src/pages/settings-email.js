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

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../prop-types/messages';

import BaseSettingsPage from './base/settings';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';

class SettingsEmailPage extends React.Component {
  static displayName = 'SettingsPasswordPage';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    messages: ArrayOfMessagesPropType
  };

  static async fetchData(router, store, client) {
    const props = store.getState();
    const currentUserId = props.get('current_user').get('id');

    if (currentUserId === null) {
      return;
    }

    const currentUser = props.get('users').get(currentUserId);

    const userInfo = client.userInfo(currentUser.get('username'));
    store.dispatch(addUser(await userInfo));
  }

  handleMuteAllPosts = async () => {
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    await triggers.updateUserInfo({
      more: {
        mute_all_posts: this.form.mute_all_posts.checked,
      }
    });
  };

  render() {
    const {
      current_user,
      is_logged_in,
      messages,
      following,
      followers
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <BaseSettingsPage
        current_user={current_user}
        followers={followers}
        following={following}
        is_logged_in={is_logged_in}
        messages={messages}
        triggers={triggers}
      >
        <Helmet title="Email Settings on " />
        <div className="paper__page">
          <h2 className="content__sub_title layout__row layout__row-small">Email settings</h2>
          <div className="layout__row">
            <form className="paper__page" ref={c => this.form = c}>
              <label className="layout__row layout__row-small" htmlFor="mute_all_posts">
                <input
                  checked={current_user.user.more.mute_all_posts}
                  id="mute_all_posts"
                  name="mute_all_posts"
                  type="checkbox"
                  onClick={this.handleMuteAllPosts}
                />
                <span className="checkbox__label-right">Turn off all email notifications about new comments</span>
              </label>
            </form>
          </div>
        </div>
      </BaseSettingsPage>
    );
  }
}

export default connect(defaultSelector)(SettingsEmailPage);
