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
import { IndexLink } from 'react-router';
import { isEmpty } from 'lodash';

import {
  mapOf as mapOfPropType,
  uuid4 as uuid4PropType
} from '../../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  User as UserPropType
} from '../../prop-types/users';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import Breadcrumbs from '../../components/breadcrumbs/breadcrumbs';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import PageContentLink from '../../components/page-content-link';
import ProfileHeader from '../../components/profile';
import Sidebar from '../../components/sidebar';
import SidebarAlt from '../../components/sidebarAlt';
import User from '../../components/user';

// FIXME: These links won't hide/show properly if following/unfollowing is performed directly on the page.
// Something is wrong with the redux state.

const BaseUserPage = (props) => {
  const {
    children,
    current_user,
    i_am_following,
    is_logged_in,
    page_user,
    following,
    followers,
    triggers
  } = props;

  const showLikesLink = (
    !isEmpty(page_user.liked_posts) ||
    !isEmpty(page_user.liked_hashtags) ||
    !isEmpty(page_user.liked_schools) ||
    !isEmpty(page_user.liked_geotags)
  );
  const showFavouritesLink = page_user.favourited_posts && !!page_user.favourited_posts.length;
  const showBioLink = page_user.more && !!page_user.more.bio;

  let name = page_user.username;

  if (page_user.more) {
    if (page_user.more.firstName || page_user.more.lastName) {
      name = `${page_user.more.firstName} ${page_user.more.lastName}`;
    }
  }

  return (
    <div>
      <Header current_user={current_user} is_logged_in={is_logged_in}>
        <HeaderLogo small />
        <div className="header__breadcrumbs">
          <Breadcrumbs title={name}>
            <User
              avatar={{ size: 36, isRound: true }}
              isLink={false}
              text={{ hide: true }}
              user={page_user}
            />
          </Breadcrumbs>
        </div>
      </Header>

      <Page>
        <Sidebar current_user={current_user} />
        <PageMain className="page__main-no_space">
          <ProfileHeader
            current_user={current_user}
            editable={false}
            followers={followers}
            following={following}
            i_am_following={i_am_following}
            triggers={triggers}
            user={page_user}
          />
          <PageBody>
            <PageContent>
              <div className="layout__space-double">
                <div className="layout__grid tabs">
                  <div className="layout__grid_item">
                    <IndexLink activeClassName="tabs__link-active" className="tabs__link" to={`/user/${page_user.username}`}>Posts</IndexLink>
                  </div>
                  {showLikesLink &&
                    <div className="layout__grid_item">
                      <PageContentLink
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/user/${page_user.username}/likes`}
                        visible
                      >
                        Likes
                      </PageContentLink>
                    </div>
                  }
                  {showFavouritesLink &&
                    <div className="layout__grid_item">
                      <PageContentLink
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/user/${page_user.username}/favorites`}
                        visible
                      >
                        Favorites
                      </PageContentLink>
                    </div>
                  }
                  {showBioLink &&
                    <div className="layout__grid_item">
                      <PageContentLink
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/user/${page_user.username}/bio`}
                        visible
                      >
                        Bio
                      </PageContentLink>
                    </div>
                  }
                </div>
              </div>
              <div className="layout__row layout__row-double">
                {children}
              </div>
            </PageContent>
            <SidebarAlt />
          </PageBody>
        </PageMain>
      </Page>
      <Footer />
    </div>
  );
};

BaseUserPage.displayName = 'BaseUserPage';

BaseUserPage.propTypes = {
  children: PropTypes.node,
  current_user: CurrentUserPropType,
  followers: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType),
  following: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType),
  i_am_following: ArrayOfUsersIdPropType,
  is_logged_in: PropTypes.bool.isRequired,
  page_user: UserPropType.isRequired
};

export default BaseUserPage;
