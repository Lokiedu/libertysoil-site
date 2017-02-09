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

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';
import { createSelector, currentUserSelector } from '../../selectors';


class SettingsEmailPage extends React.Component {
  static displayName = 'SettingsPasswordPage';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

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
    } = this.props;

    if (!is_logged_in) {
      return false;
    }

    return (
      <div>
        <Helmet title="Email Settings on " />
        <div className="paper__page">
          <h2 className="content__sub_title layout__row layout__row-small">Email settings</h2>
          <div className="layout__row">
            <form className="paper__page" ref={c => this.form = c}>
              <label className="layout__row layout__row-small" htmlFor="mute_all_posts">
                <input
                  checked={current_user.getIn(['user', 'more', 'mute_all_posts'])}
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
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('messages'),
  state => state.get('following'),
  state => state.get('followers'),
  (current_user, messages, following, followers) => ({
    messages,
    following,
    followers,
    ...current_user
  })
);

export default connect(selector)(SettingsEmailPage);
