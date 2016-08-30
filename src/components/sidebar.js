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
import React, { PropTypes } from 'react';
import { values, throttle } from 'lodash';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Immutable as ImmutablePropType } from '../prop-types/common';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import { toggleSidebar } from '../actions/ui';

import Navigation from './navigation';
import NavigationItem from './navigation-item';
import CurrentUser from './current-user';
import TagCloud from './tag-cloud';
import SidebarFollowedTags from './sidebar-followed-tags';
import currentUserSelector from '../selectors/currentUser';
import createSelector from '../selectors/createSelector';

class Sidebar extends React.Component {
  static displayName = 'Sidebar';

  static propTypes = {
    current_user: ImmutablePropType(CurrentUserPropType),
    dispatch: PropTypes.func.isRequired,
    is_logged_in: PropTypes.bool.isRequired
  };

  static contextTypes = {
    routeLocation: PropTypes.shape({})
  };

  constructor(props) {
    super(props);

    this.state = {
      clientWidth: 0
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.toggleVisible);
    document.addEventListener('DOMContentLoaded', this.toggleVisible);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.toggleVisible);
    document.removeEventListener('DOMContentLoaded', this.toggleVisible);
  }

  toggleVisible = throttle(() => {
    const {
      dispatch,
      ui
    } = this.props;
    const breakpointWidth = 1330;

    if (typeof document == 'undefined') {
      return;
    }

    const clientWidth = document.body.clientWidth;

    if (clientWidth == this.state.clientWidth) {
      return;
    }

    if (ui.get('sidebarIsVisible') && (clientWidth <= breakpointWidth) && (clientWidth < this.state.clientWidth)) {
      dispatch(toggleSidebar(false));
    }

    if (!ui.get('sidebarIsVisible') && (clientWidth >= breakpointWidth) && (clientWidth > this.state.clientWidth)) {
      dispatch(toggleSidebar(true));
    }

    // If DOMContentLoaded event and small screen width
    if (this.state.clientWidth == 0 && clientWidth <= breakpointWidth) {
      dispatch(toggleSidebar(false));
    }

    this.setState({ clientWidth });
  }, 100);

  render() {
    const { routeLocation } = this.context;
    const {
      ui,
      is_logged_in
    } = this.props;
    const sidebarClassName = ['sidebar'];

    if (!is_logged_in) {
      return null;
    }

    if (ui.get('sidebarIsVisible')) {
      sidebarClassName.push('sidebar-visible');
    }

    const current_user = this.props.current_user.toJS();

    const followedTags = values(current_user.followed_hashtags);
    const followedSchools = values(current_user.followed_schools);
    const followedGeotags = values(current_user.followed_geotags);

    const showLikes =
      (current_user.likes && current_user.likes.length)
      || this.props.current_user.get('liked_hashtags').size
      || this.props.current_user.get('liked_geotags').size
      || this.props.current_user.get('liked_schools').size;
    const showFavorites = (current_user.favourites && current_user.favourites.length > 0);
    const showFollowedTags = followedTags.length || followedSchools.length || followedGeotags.length;
    const showUsedTags = current_user.hashtags.length || current_user.geotags.length || current_user.schools.length;

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
              geotags={current_user.geotags}
              hashtags={current_user.hashtags}
              schools={current_user.schools}
              truncated
            />
          </div>
        </div>
      );
    }

    const username = current_user.user.username;
    const test = RegExp(`user\/${username}\/?$`);
    let currentUser;

    if (routeLocation && routeLocation.pathname.match(test)) {
      currentUser = (
        <NavigationItem className="sidebar__user" enabled to={`/user/${username}`}>
          <CurrentUser isLink={false} user={current_user.user} />
        </NavigationItem>
      );
    } else {
      currentUser = (
        <Link className="navigation__item sidebar__user" to={`/user/${username}`}>
          <CurrentUser isLink={false} user={current_user.user} />
        </Link>
      );
    }

    return (
      <div className={sidebarClassName.join(' ')}>
        <Navigation className="navigation-first">
          <NavigationItem enabled icon="public" to="/">News Feed</NavigationItem>
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
