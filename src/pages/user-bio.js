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
import _ from 'lodash';

import NotFound from './not-found'
import BaseUserPage from './base/user'

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import {getStore, addUser} from '../store';
import {followUser, unfollowUser} from '../triggers'
import { defaultSelector } from '../selectors';

class AboutUserPage extends React.Component {
  componentDidMount() {
    AboutUserPage.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      let userInfo = client.userInfo(props.params.username);

      getStore().dispatch(addUser(await userInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    let page_user = _.find(this.props.users, {username: this.props.params.username});
    let linesOfBio = <p>No information provided...</p>;

    if (_.isUndefined(page_user)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound/>
    }

    let user_triggers = {followUser, unfollowUser};

    if (page_user.more) {
      if (page_user.more.bio) {
        linesOfBio = page_user.more.bio.split("\n").map((line, i) => <p key={`bio-${i}`}>{line}</p>);
      }
    }



    return (
      <BaseUserPage
        current_user={this.props.current_user}
        i_am_following={this.props.i_am_following}
        is_logged_in={this.props.is_logged_in}
        page_user={page_user}
        triggers={user_triggers}
      >
        <div className="paper">
          <div className="paper__page content">
            {linesOfBio}
          </div>
        </div>
      </BaseUserPage>
    )
  }
}

export default connect(defaultSelector)(AboutUserPage);
