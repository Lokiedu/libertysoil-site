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
import React, { Component } from 'react';
import { connect } from 'react-redux';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { setGeotagPosts, addGeotag } from '../actions';
import NotFound from './not-found';
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import FollowTagButton from '../components/follow-tag-button';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';


export class GeotagPage extends Component {
  static displayName = 'GeotagPage';

  static async fetchData(params, store, client) {
    let geotag = client.getGeotag(params.url_name);
    let geotagPosts = client.geotagPosts(params.url_name);

    try {
      geotag = await geotag;
    } catch (e) {
      store.dispatch(addGeotag({url_name: params.url_name}));

      return 404;
    }

    store.dispatch(addGeotag(geotag));
    store.dispatch(setGeotagPosts(params.url_name, await geotagPosts));
  }

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      geotags,
      geotag_posts,
      users
    } = this.props;

    let client = new ApiClient(API_HOST);
    let triggers = new ActionsTrigger(client, this.props.dispatch);
    let geotag = geotags[this.props.params.url_name];
    let tagPosts = geotag_posts[this.props.params.url_name] || [];

    if (!geotag) {
      return null;
    }

    if (!geotag.id) {
      return <NotFound/>;
    }

    let followTriggers = {
      followTag: triggers.followGeotag,
      unfollowTag: triggers.unfollowGeotag
    };

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <div className="tag_header">
                <div className="layout__grid">
                  <div className="layout__grid_item layout__grid_item-wide">
                    {(geotag) ? geotag.name : this.props.params.url_name}
                  </div>
                  <div className="layout__grid_item layout__grid_item-small">
                    {current_user &&
                      <FollowTagButton
                        current_user={current_user}
                        followed_tags={current_user.followed_geotags}
                        tag={this.props.params.url_name}
                        triggers={followTriggers}
                      />
                    }
                  </div>
                </div>
              </div>
              <div className="page__content page__content-spacing">
                <River river={tagPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
              </div>
            </div>

            <SidebarAlt />
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(GeotagPage);
