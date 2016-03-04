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

import NavigationItem from './navigation-item';
import CurrentUser from './current-user';
import TagCloud from './tag-cloud';
import SidebarFollowedTags from './sidebar-followed-tags';
import currentUserSelector from '../selectors/currentUser';


class Sidebar extends React.Component {
  static displayName = 'Sidebar';

  render() {
    if (!this.props.is_logged_in) {
      return null;
    }

    let current_user = this.props.current_user.toJS();

    let followedTags = _.values(current_user.followed_hashtags);
    let followedSchools = _.values(current_user.followed_schools);
    let followedGeotags = _.values(current_user.followed_geotags);
    let showLikes = (current_user.likes && current_user.likes.length > 0);
    let showFavorites = (current_user.favourites && current_user.favourites.length > 0);
    let showFollowedTags = !!followedTags.length || !!followedSchools.length || !!followedGeotags.length;
    let showUsedTags = current_user.hashtags && !!current_user.hashtags.length;

    return (
      <div className="page__sidebar font-open_sans">
        <div className="page__sidebar_user">
          <CurrentUser user={current_user.user} />
        </div>

        <div className="navigation navigation-sidebar">
          <NavigationItem enabled to="/" icon="star" icon="public">News Feed</NavigationItem>
          {showLikes &&
            <NavigationItem
              enabled
              icon="favorite"
              to={`/user/${current_user.user.username}/likes`}
            >
              My Likes
            </NavigationItem>
          }
          {showFavorites &&
            <NavigationItem
              enabled
              icon="star"
              to={`/user/${current_user.user.username}/favorites`}
            >
              My Favorites
            </NavigationItem>
          }
        </div>

        {showFollowedTags &&
          <div className="layout__row layout__row-double">
            <h4 className="sidebar__heading">I follow</h4>
            <div className="layout__row">
              <SidebarFollowedTags geotags={followedGeotags} hashtags={followedTags} schools={followedSchools} />
            </div>
          </div>
        }

        {showUsedTags &&
          <div className="layout__row layout__row-double">
            <h4 className="sidebar__heading">I post to</h4>
            <div className="sidebar__user_tags layout__row">
              <TagCloud
                hashtags={current_user.hashtags}
                schools={[]}
                truncated
              />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default connect(currentUserSelector)(Sidebar);
