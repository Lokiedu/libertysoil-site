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
import {
  Route,
  IndexRoute,
  Redirect,
  IndexRedirect
} from 'react-router';
import React from 'react';

import { combineHandlers, combineHandlersAsync } from './utils/loader';

import App from './pages/app';
import Auth from './pages/auth';
import NewPassword from './pages/new-password';
import PasswordReset from './pages/password-reset';
import PostPage from './pages/post';
import PostEditPage from './pages/post-edit';
import UserPage from './pages/user';
import UserLikesPage from './pages/user-likes';
import UserFavoritesPage from './pages/user-favorites';
import AboutUserPage from './pages/user-bio';
import SchoolPage from './pages/school';
import SchoolEditPage from './pages/school-edit';
import SettingsPage from './pages/settings';
import SettingsEmailPage from './pages/settings-email';
import SettingsPasswordPage from './pages/settings-password';
import SettingsFollowersPage from './pages/settings-followers';
import SuggestionsPage from './pages/suggestions';
import TagPage from './pages/tag';
import HashtagEditPage from './pages/hashtag-edit';
import TagCloudPage from './pages/tag-cloud';
import SchoolCloudPage from './pages/school-cloud';
import GeotagCloudPage from './pages/geotag-cloud';
import GeotagPage from './pages/geotag';
import GeotagEditPage from './pages/geotag-edit';
import BaseToolsPage from './pages/base/tools';
import SchoolsToolPage from './pages/tools/schools-tool';
import MyPostsToolPage from './pages/tools/my-posts-tool';
import PeopleToolPage from './pages/tools/people-tool';

import List from './pages/list';
import Induction from './pages/induction';
import Welcome from './pages/welcome';

export function getRoutes(authHandler, fetchHandler) {
  const withoutAuth = fetchHandler;
  let withAuth;

  if (authHandler.length >= 3 || fetchHandler.length >= 3) {
    withAuth = combineHandlersAsync(authHandler, fetchHandler);
  } else {
    withAuth = combineHandlers(authHandler, fetchHandler);
  }

  return (
    <Route component={App}>
      <Route component={List} path="/" onEnter={withAuth} />
      <Route component={Induction} path="/induction" onEnter={withAuth} />
      <Route component={SuggestionsPage} path="/suggestions" onEnter={withAuth} />
      <Route component={Welcome} path="/welcome" onEnter={withoutAuth} />
      <Route component={Auth} path="/auth" onEnter={withoutAuth} />
      <Route component={PostPage} path="/post/:uuid" onEnter={withoutAuth} />
      <Route component={PostEditPage} path="/post/edit/:uuid" onEnter={withAuth} />
      <Route path="/tag">
        <IndexRoute component={TagCloudPage} onEnter={withoutAuth} />
        <Route path="/tag/:tag">
          <IndexRoute component={TagPage} onEnter={withoutAuth} />
          <Route component={HashtagEditPage} path="/tag/:tag/edit" onEnter={withAuth} />
        </Route>
      </Route>
      <Route path="/settings">
        <IndexRoute component={SettingsPage} onEnter={withAuth} />
        <Route component={SettingsEmailPage} path="email" onEnter={withAuth} />
        <Route component={SettingsPasswordPage} path="password" onEnter={withAuth} />
        <Route component={SettingsFollowersPage} path="followers" onEnter={withAuth} />
      </Route>
      <Route path="/user/:username">
        <IndexRoute component={UserPage} onEnter={withoutAuth} />
        <Route component={UserLikesPage} path="/user/:username/likes" onEnter={withoutAuth} />
        <Route component={UserFavoritesPage} path="/user/:username/favorites" onEnter={withoutAuth} />
        <Route component={AboutUserPage} path="/user/:username/bio" onEnter={withoutAuth} />
      </Route>
      <Route path="/s">
        <IndexRoute component={SchoolCloudPage} onEnter={withoutAuth} />
        <Route path="/s/:school_name">
          <IndexRoute component={SchoolPage} onEnter={withoutAuth} />
          <Route component={SchoolEditPage} path="/s/:school_name/edit" onEnter={withAuth} />
        </Route>
      </Route>
      <Route path="/geo">
        <IndexRoute component={GeotagCloudPage} onEnter={withoutAuth} />
        <Route path="/geo/:url_name">
          <IndexRoute component={GeotagPage} onEnter={withoutAuth} />
          <Route component={GeotagEditPage} path="/geo/:url_name/edit" onEnter={withAuth} />
        </Route>
      </Route>
      <Route component={PasswordReset} path="/resetpassword" onEnter={withoutAuth} />
      <Route component={NewPassword} path="/newpassword/:hash" onEnter={withoutAuth} />
      <Route component={BaseToolsPage} path="/tools">
        <Redirect from="tags" to="schools" />
        <Route component={SchoolsToolPage} path="schools" onEnter={withAuth} />
        <Route path="my">
          <IndexRedirect to="posts" />
          <Route component={MyPostsToolPage} path="posts" onEnter={withAuth} />
        </Route>
        <Route path="people">
          <IndexRedirect to="following" />
          <Route component={PeopleToolPage} path="following" onEnter={withAuth} />
        </Route>
      </Route>
    </Route>
  );
}
