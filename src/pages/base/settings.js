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
import { Link, IndexLink } from 'react-router';

import Header from '../../components/header';
import Footer from '../../components/footer';
import ProfileHeader from '../../components/profile';
import Sidebar from '../../components/sidebar';

export default class BaseSettingsPage extends React.Component {
  static displayName = 'BaseSettingsPage'
  render () {
    let {user, i_am_following, is_logged_in} = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={user}/>

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={user}/>

            <div className="page__body_content">
              <ProfileHeader user={user} current_user={user} i_am_following={i_am_following} triggers={this.props.triggers} />
              <div className="page__content page__content-spacing">
                {this.props.children}
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}
