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

export default class BaseUserPage extends React.Component {
  static displayName = 'BaseUserPage'
  render () {
    let {current_user, i_am_following, is_logged_in, page_user} = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user}/>

            <div className="page__body_content">
              <ProfileHeader user={page_user} current_user={current_user} i_am_following={i_am_following} triggers={this.props.triggers} />

              <div className="page__content page__content-horizontal_space">
                <div className="layout__space-double">
                  <div className="layout__grid tabs">
                    <div className="layout__grid_item"><IndexLink className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}`}>Posts</IndexLink></div>
                    {/*<div className="layout__grid_item"><Link className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/likes`}>Likes</Link></div>*/}
                    {/*<div className="layout__grid_item"><Link className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/favorites`}>Favorites</Link></div>*/}
                    {/*<div className="layout__grid_item"><Link className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/about`}>About</Link></div>*/}
                  </div>
                </div>
                <div className="layout__row layout__row-double">
                  {this.props.children}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}
