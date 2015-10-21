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
import React, { Component } from 'react';
import { connect } from 'react-redux';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore, addUser, addError } from '../store';

import Header from '../components/header';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar'
import UsersGrid from '../components/users-grid';

import { followUser, unfollowUser } from '../triggers'
import { defaultSelector } from '../selectors';


class UsersPage extends Component {
  static displayName = 'UsersPage'

  componentDidMount() {
    UsersPage.fetchData(this.props, new ApiClient(API_HOST));
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
    const {
      i_am_following,
      users,
      current_user,
      is_logged_in
    } = this.props;
    const triggers = { followUser, unfollowUser };
    const usersArray = Object.keys(users).map(id => users[id]);

    console.info(usersArray);

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />
            <div className="page__body_content">
              <div className="page__content">
                <div className="paper">
                  <div className="paper__page">
                    <h2 className="content__sub_title layout__row">Top users</h2>
                    <div className="layout__row layout__row-double">
                      {false && <UsersGrid
                        current_user={current_user}
                        empty_msg="No top users..."
                        i_am_following={i_am_following}
                        triggers={triggers}
                        users={usersArray}
                      />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(UsersPage);
