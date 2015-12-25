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
import _ from 'lodash';
import { connect } from 'react-redux';
import { Link, IndexLink } from 'react-router';

import ApiClient from '../api/client'
import {API_HOST} from '../config';
import { getStore } from '../store';
import { setUserTags } from '../actions';
import NavigationItem from './navigation-item';
import CurrentUser from './current-user';
import TagCloud from './tag-cloud';
import SidebarFollowedTags from './sidebar-followed-tags';
import { defaultSelector } from '../selectors';

class Sidebar extends React.Component {
  static displayName = 'Sidebar'

  componentDidMount() {
    Sidebar.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      if (!props.current_user) {
        return;
      }
      let userTags = client.userTags();

      getStore().dispatch(setUserTags(await userTags));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    if (!this.props.current_user || !this.props.current_user_tags) {
      return <script/>
    }

    let {
      current_user
    } = this.props;

    let likes_enabled = (current_user.likes && current_user.likes.length > 0);
    let favorites_enabled = (current_user.favourites && current_user.favourites.length > 0);
    let followedTags = _.values(current_user.followed_tags);
    let followedSchools = _.values(current_user.followed_schools);

    return (
      <div className="page__sidebar font-open_sans">
        <div className="page__sidebar_user">
          <CurrentUser user={current_user} />
        </div>
        <div className="navigation navigation-sidebar">
          <NavigationItem enabled to="/" icon="star" icon="public">News Feed</NavigationItem>
          <NavigationItem enabled={likes_enabled} to={`/user/${current_user.username}/likes`} icon="favorite">My Likes</NavigationItem>
          <NavigationItem  enabled={favorites_enabled} to={`/user/${current_user.username}/favorites`} icon="star">My Favorites</NavigationItem>
        </div>

        <div className="layout__row layout__row-double">
          <h4 className="sidebar__heading">I follow</h4>
          <div className="layout__row">
            <SidebarFollowedTags tags={followedTags} schools={followedSchools} />
          </div>
        </div>

        <div className="layout__row layout__row-double">
          <h4 className="sidebar__heading">I post to</h4>
          <div className="sidebar__user_tags layout__row">
            <TagCloud tags={this.props.current_user_tags}/>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(defaultSelector)(Sidebar);
