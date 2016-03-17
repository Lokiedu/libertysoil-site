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
import {
  values,
  throttle
} from 'lodash';
import { connect } from 'react-redux';

import { toggleUISidebar } from '../actions';

import NavigationItem from './navigation-item';
import CurrentUser from './current-user';
import TagCloud from './tag-cloud';
import SidebarFollowedTags from './sidebar-followed-tags';
import currentUserSelector from '../selectors/currentUser';
import createSelector from '../selectors/createSelector';

class Sidebar extends React.Component {
  static displayName = 'Sidebar';

  state = {
    clientWidth: 0
  };

  constructor (props) {
    super(props);

    if (typeof document != 'undefined') {

    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.toggleVisible);
    document.addEventListener('DOMContentLoaded', this.toggleVisible);
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.toggleVisible);
    document.removeEventListener('DOMContentLoaded', this.toggleVisible);
  }

  toggleVisible = throttle(() => {
    const {
      dispatch,
      ui
    } = this.props;
    const breakpointWidth = 960;

    if (typeof document == 'undefined') {
      return;
    }

    const clientWidth = document.body.clientWidth;

    if (clientWidth == this.state.clientWidth) {
      return;
    }

    if (ui.get('sidebarIsVisible') && (clientWidth <= breakpointWidth) && (clientWidth < this.state.clientWidth)) {
      dispatch(toggleUISidebar(false));
    }

    if (!ui.get('sidebarIsVisible') && (clientWidth >= breakpointWidth) && (clientWidth > this.state.clientWidth)) {
      dispatch(toggleUISidebar(true));
    }

    this.setState({
      clientWidth: clientWidth
    });
  }, 100);

  render() {
    const {
      ui,
      is_logged_in
    } = this.props;
    let sidebarClassName = ['sidebar'];

    if (!is_logged_in) {
      return null;
    }

    if (ui.get('sidebarIsVisible')) {
      sidebarClassName.push('sidebar-visible');
    }

    let current_user = this.props.current_user.toJS();

    let followedTags = values(current_user.followed_hashtags);
    let followedSchools = values(current_user.followed_schools);
    let followedGeotags = values(current_user.followed_geotags);
    let showLikes = (current_user.likes && current_user.likes.length > 0);
    let showFavorites = (current_user.favourites && current_user.favourites.length > 0);
    let showFollowedTags = !!followedTags.length || !!followedSchools.length || !!followedGeotags.length;
    let showUsedTags = current_user.hashtags && !!current_user.hashtags.length;

    return (
      <div className={sidebarClassName.join(' ')}>
        <div className="sidebar__user">
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

const selector = createSelector(
  state => state.get('ui'),
  currentUserSelector,
  (ui, current_user) => ({
    ui,
    ...current_user
  })
);

export default connect(selector)(Sidebar);
