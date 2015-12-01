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
import {Route, IndexRoute} from 'react-router';
import React from 'react';

import App from './pages/app';
import Auth from './pages/auth';
import MaybeList from './pages/maybe_list';
import PostPage from './pages/post';
import PostEditPage from './pages/post_edit';
import UserPage from './pages/user';
import UserLikesPage from './pages/user-likes';
import UserFavoritesPage from './pages/user-favorites';
import AboutUserPage from './pages/user-bio';
import SchoolPage from './pages/school';
import SchoolPostsPage from './pages/school-posts';
import SettingsPage from './pages/settings';
import SettingsPasswordPage from './pages/settings-password';
import SettingsFollowersPage from './pages/settings-followers';
import TagPage from './pages/tag';
import CityPage from './pages/city';
import CountryPage from './pages/country';


export function getRoutes(onEnterHandler) {
  return (
    <Route component={App}>
      <Route component={MaybeList} path="/" onEnter={onEnterHandler} />
      <Route component={Auth} path="/auth" onEnter={onEnterHandler} />
      <Route component={PostPage} path="/post/:uuid" onEnter={onEnterHandler} />
      <Route component={PostEditPage} path="/post/edit/:uuid" onEnter={onEnterHandler} />
      <Route component={TagPage} path="/tag/:tag" onEnter={onEnterHandler} />
      <Route path="/settings">
        <IndexRoute component={SettingsPage} onEnter={onEnterHandler} />
        <Route component={SettingsPasswordPage} path="password" onEnter={onEnterHandler} />
        <Route component={SettingsFollowersPage} path="followers" onEnter={onEnterHandler} />
      </Route>
      <Route path="/user/:username">
        <IndexRoute component={UserPage} onEnter={onEnterHandler} />
        <Route component={UserLikesPage} path="/user/:username/likes" onEnter={onEnterHandler} />
        <Route component={UserFavoritesPage} path="/user/:username/favorites" onEnter={onEnterHandler} />
        <Route component={AboutUserPage} path="/user/:username/bio" onEnter={onEnterHandler} />
      </Route>
      <Route path="/s/:school_name">
        <IndexRoute component={SchoolPage} onEnter={onEnterHandler} />
        <Route component={SchoolPostsPage} path="/s/:school_name/posts" onEnter={onEnterHandler} />
      </Route>
      <Route path="/l/:country">
        <IndexRoute component={CountryPage} onEnter={onEnterHandler} />
        <Route component={CityPage} path="/l/:country/:city" onEnter={onEnterHandler} />
      </Route>
    </Route>
  );
}
