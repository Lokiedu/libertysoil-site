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
import { connect } from 'react-redux';
import _ from 'lodash';
import Helmet from 'react-helmet';

import {
  uuid4 as uuid4PropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
import {
  MapOfPosts as MapOfPostsPropType,
  ArrayOfPostsId as ArrayOfPostsIdPropType
} from '../prop-types/posts';

import NotFound from './not-found';
import BaseUserFavoritesPage from './base/user';
import River from '../components/river_of_posts';
import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { addUser } from '../actions/users';
import { setPostsToFavouritesRiver } from '../actions/river';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';

class UserFavoritesPage extends React.Component {
  static displayName = 'UserFavoritesPage';

  static propTypes = {
    favourites_river: mapOfPropType(uuid4PropType, ArrayOfPostsIdPropType).isRequired,
    posts: MapOfPostsPropType.isRequired
  };

  static async fetchData(params, store, client) {
    const userInfo = await client.userInfo(params.username);
    store.dispatch(addUser(userInfo));

    const favouredPosts = client.getFavouredPosts(params.username);
    store.dispatch(setPostsToFavouritesRiver(userInfo.id, await favouredPosts));
  }

  render() {
    const page_user = _.find(this.props.users, { username: this.props.params.username });
    const {
      posts,
      current_user,
      users,
      comments,
      ui,
      i_am_following,
      is_logged_in,
      following,
      followers,
      favourites_river
    } = this.props;

    if (_.isUndefined(page_user)) {
      return null;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound />;
    }

    //console.info(this.props);

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let userFavouritesRiver = favourites_river[page_user.id];
    if (!userFavouritesRiver) {
      userFavouritesRiver = [];
    }

    return (
      <BaseUserFavoritesPage
        current_user={current_user}
        following={following}
        followers={followers}
        i_am_following={i_am_following}
        is_logged_in={is_logged_in}
        page_user={page_user}
        triggers={triggers}
      >
        <Helmet title={`Favorites of ${page_user.fullName} on `} />
        <River
          current_user={current_user}
          posts={posts}
          river={userFavouritesRiver}
          triggers={triggers}
          users={users}
          comments={comments}
          ui={ui}
        />
      </BaseUserFavoritesPage>
    );
  }
}

export default connect(defaultSelector)(UserFavoritesPage);
