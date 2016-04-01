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

import Navigation from './navigation';
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
    const breakpointWidth = 1024;

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

    // If DOMContentLoaded event and small screen width
    if (this.state.clientWidth == 0 && clientWidth <= breakpointWidth) {
      dispatch(toggleUISidebar(false));
    }

    this.setState({
      clientWidth: clientWidth
    });
  }, 100);

  render() {
    const {
      ui,
      is_logged_in,
      routing
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

    let showLikes =
      (current_user.likes && current_user.likes.length)
      || this.props.current_user.get('liked_hashtags').size
      || this.props.current_user.get('liked_geotags').size
      || this.props.current_user.get('liked_schools').size;
    let showFavorites = (current_user.favourites && current_user.favourites.length > 0);
    let showFollowedTags = followedTags.length || followedSchools.length || followedGeotags.length;
    let showUsedTags = current_user.hashtags.length || current_user.geotags.length || current_user.schools.length;

    let followedTagsSection;
    if (showFollowedTags) {
      followedTagsSection = (
        <div className="layout__row layout__row-double">
          <h4 className="sidebar__heading">I follow</h4>
          <Navigation>
            <SidebarFollowedTags geotags={followedGeotags} hashtags={followedTags} schools={followedSchools} />
          </Navigation>
        </div>
      );
    }

    let likesSection;
    if (showLikes) {
      likesSection = (
        <NavigationItem
          enabled
          icon="favorite"
          to={`/user/${current_user.user.username}/likes`}
        >
          My Likes
        </NavigationItem>
      );
    }

    let favouritesSection;
    if (showFavorites) {
      favouritesSection = (
        <NavigationItem
          enabled
          icon="star"
          to={`/user/${current_user.user.username}/favorites`}
        >
          My Favorites
        </NavigationItem>
      );
    }

    let usedTagsSection;
    if (showUsedTags) {
      usedTagsSection = (
        <div className="layout__row layout__row-double">
          <h4 className="sidebar__heading">I post to</h4>
          <div className="sidebar__user_tags">
            <TagCloud
              hashtags={current_user.hashtags}
              schools={current_user.schools}
              geotags={current_user.geotags}
              truncated
            />
          </div>
        </div>
      );
    }

    const username = current_user.user.username;
    const test = RegExp(`user/${username}\/?`, 'i');
    let currentUser;
    if (routing && routing.locationBeforeTransitions.pathname.match(test)) {
      currentUser = (
        <NavigationItem enabled to={`/user/${username}`} className="sidebar__user">
          <CurrentUser user={current_user.user} isLink={false} />
        </NavigationItem>
      );
    } else {
      currentUser = (
        <div className="navigation__item sidebar__user">
          <CurrentUser user={current_user.user} />
        </div>
      );
    }

    return (
      <div className={sidebarClassName.join(' ')}>
        <Navigation className="navigation-first">
          <NavigationItem enabled to="/" icon="public">News Feed</NavigationItem>
          {currentUser}
          {likesSection}
          {favouritesSection}
        </Navigation>

        {followedTagsSection}
        {usedTagsSection}
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
