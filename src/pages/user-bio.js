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
import Helmet from 'react-helmet';

import NotFound from './not-found';
import BaseUserPage from './base/user';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';


class AboutUserPage extends React.Component {
  static async fetchData(params, store, client) {
    const userInfo = client.userInfo(params.username);
    store.dispatch(addUser(await userInfo));
  }

  render() {
    const page_user = _.find(this.props.users, { username: this.props.params.username });
    let linesOfBio = <p>No information provided...</p>;

    if (_.isUndefined(page_user)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound/>;
    }

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

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
