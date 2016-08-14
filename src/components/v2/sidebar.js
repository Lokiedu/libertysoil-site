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
import React from 'react';

// v1
import Navigation from '../navigation';
import NavigationItem from '../navigation-item';

// v2
import TagsInformer from './tags-informer';
import Bookmarks from './bookmarks';

export default class SidebarV2 extends React.Component {
  render() {
    const { current_user } = this.props;
    const { user } = current_user;

    const mainMenuItems = [
      { title: "News Feed", url: '/', ico: '' },
      { title: "My Likes", url: `/user/${user.username}/likes`, ico: '' },
      { title: "My Favorites", url: `/user/${user.username}/favorites`, ico: '' },
      { title: "Collections", url: '/collections', ico: '' }
    ];

    const followedTags = {
      geotags: { list: current_user.followed_geotags },
      hashtags: { list: current_user.followed_hashtags },
      schools: { list: current_user.followed_schools }
    };

    return (
      <div className="col-l-4 margin-l">
        <Navigation>
          {mainMenuItems.map((item, i) => (
            <NavigationItem
              enabled
              key={i}
              to={item.url}
            >
              {item.title}
            </NavigationItem>
            ))
          }
        </Navigation>

        <TagsInformer tags={followedTags} />
        {/*<Bookmarks bookmarks={user.bookmarks} />*/}
      </div>
    );
  }
}
