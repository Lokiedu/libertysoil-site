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
import { throttle } from 'lodash';
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
      is_logged_in,
      current_user
    } = this.props;
    const sidebarClassName = ['sidebar'];

    if (!is_logged_in) {
      return null;
    }

    if (ui.get('sidebarIsVisible')) {
      sidebarClassName.push('sidebar-visible');
    }

    const followedTags = current_user.get('followed_hashtags').toList();
    const followedSchools = current_user.get('followed_schools').toList();
    const followedGeotags = current_user.get('followed_geotags').toList();
    const hashtags = current_user.get('hashtags');
    const schools = current_user.get('schools');
    const geotags = current_user.get('geotags');
    const username = current_user.getIn(['user', 'username']);

    const showLikes =
      (current_user.get('likes') && current_user.get('likes').size)
      || current_user.get('liked_hashtags').size
      || current_user.get('liked_geotags').size
      || current_user.get('liked_schools').size;
    const showFavorites = (current_user.get('favorites') && current_user.get('favotites').size > 0);
    const showFollowedTags = followedTags.size || followedSchools.size || followedGeotags.size;
    const showUsedTags = hashtags.size || schools.size || geotags.size;

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
          to={`/user/${username}/likes`}
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
          to={`/user/${username}/favorites`}
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
              geotags={geotags}
              hashtags={hashtags}
              schools={schools}
              truncated
            />
          </div>
        </div>
      );
    }

    const test = RegExp(`user\/${username}\/?$`);
    let currentUser;

    if (routeLocation && routeLocation.pathname.match(test)) {
      currentUser = (
        <NavigationItem className="sidebar__user" enabled to={`/user/${username}`}>
          <CurrentUser isLink={false} user={current_user.get('user')} />
        </NavigationItem>
      );
    } else {
      currentUser = (
        <Link className="navigation__item sidebar__user" to={`/user/${username}`}>
          <CurrentUser isLink={false} user={current_user.get('user')} />
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
