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
import PageContentLink from '../../components/page-content-link';
import ProfileHeader from '../../components/profile';
import Sidebar from '../../components/sidebar';

export default class BaseUserPage extends React.Component {
  static displayName = 'BaseUserPage'
  render () {
    let {
      current_user,
      i_am_following,
      is_logged_in,
      page_user,
      following,
      followers
    } = this.props;

    //let likes_visible = (page_user.likes && page_user.likes.length > 0);
    //let favourites_visible = (page_user.favourites && page_user.favourites.length > 0);
    let likes_visible = true;
    let favourites_visible = true;
    let bio_visible = page_user.more && !!page_user.more.bio;

    let likes_grid_item_class = (likes_visible)? 'layout__grid_item' : 'layout__grid_item-fill';
    let favourites_grid_item_class = (favourites_visible)? 'layout__grid_item' : 'layout__grid_item-fill';
    let bio_grid_item_class = (bio_visible)? 'layout__grid_item' : 'layout__grid_item-fill';

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user}/>

            <div className="page__body_content">
              <ProfileHeader
                user={page_user}
                current_user={current_user}
                i_am_following={i_am_following}
                following={following}
                followers={followers}
                triggers={this.props.triggers} />

              <div className="page__content page__content-horizontal_space">
                <div className="layout__space-double">
                  <div className="layout__grid tabs">
                    <div className="layout__grid_item"><IndexLink className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}`}>Posts</IndexLink></div>
                    <div className={likes_grid_item_class}><PageContentLink visible={likes_visible} className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/likes`}>Likes</PageContentLink></div>
                    <div className={favourites_grid_item_class}><PageContentLink visible={favourites_visible} className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/favorites`}>Favorites</PageContentLink></div>
                    <div className={bio_grid_item_class}><PageContentLink visible={bio_visible} className="tabs__link" activeClassName="tabs__link-active" to={`/user/${page_user.username}/bio`}>Bio</PageContentLink></div>
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
