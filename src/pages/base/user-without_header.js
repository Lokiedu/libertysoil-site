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
import PropTypes from 'prop-types';

import React from 'react';
import { IndexLink } from 'react-router';

import { CurrentUser as CurrentUserPropType } from '../../prop-types/users';

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
import Sidebar from '../../components/sidebar';
import SidebarAlt from '../../components/sidebarAlt';
import Avatar from '../../components/user/avatar';

// FIXME: These links won't hide/show properly if following/unfollowing is performed directly on the page.
// Something is wrong with the redux state.

const BaseUserPageWithoutHeader = (props) => {
  const {
    children,
    current_user,
    is_logged_in,
    user
  } = props;

  const showLikesLink = !!(
    user.get('liked_posts') && user.get('liked_posts').size ||
    user.get('liked_hashtags') && user.get('liked_hashtags').size ||
    user.get('liked_schools') && user.get('liked_schools').size ||
    user.get('liked_geotags') && user.get('liked_geotags').size
  );
  const showFavouritesLink = user.get('favourited_posts') && !!user.get('favourited_posts').size;

  const name = '@'.concat(user.get('username'));

  return (
    <div>
      <Header current_user={current_user} is_logged_in={is_logged_in}>
        <HeaderLogo />
        <Breadcrumbs className="breadcrumbs--user" title={name}>
          <Avatar
            className="breadcrumbs__avatar"
            isRound
            size={26}
            user={user}
          />
        </Breadcrumbs>
      </Header>

      <Page>
        <PageMain>
          <PageBody>
            <Sidebar />
            <PageContent>
              {children}
            </PageContent>
            <SidebarAlt>
              <div className="tabs">
                <IndexLink
                  activeClassName="color-dark_blue"
                  className="short_post short_post-spacing"
                  to={`/user/${user.get('username')}`}
                >
                  Posts
                </IndexLink>
                {showLikesLink &&
                  <PageContentLink
                    activeClassName="color-dark_blue"
                    className="short_post short_post-spacing"
                    to={`/user/${user.get('username')}/likes`}
                    visible
                  >
                    Likes
                  </PageContentLink>
                }
                {showFavouritesLink &&
                  <PageContentLink
                    activeClassName="color-dark_blue"
                    className="short_post short_post-spacing"
                    to={`/user/${user.get('username')}/favorites`}
                    visible
                  >
                    Favourites
                  </PageContentLink>
                }
                <PageContentLink
                  activeClassName="color-dark_blue"
                  className="short_post short_post-spacing"
                  to={`/user/${user.get('username')}/bio`}
                  visible
                >
                  Bio
                </PageContentLink>
              </div>
            </SidebarAlt>
          </PageBody>
        </PageMain>
      </Page>
      <Footer />
    </div>
  );
};

BaseUserPageWithoutHeader.displayName = 'BaseUserPageWithoutHeader';

BaseUserPageWithoutHeader.propTypes = {
  children: PropTypes.node,
  current_user: CurrentUserPropType,
  is_logged_in: PropTypes.bool.isRequired
};

export default BaseUserPageWithoutHeader;
