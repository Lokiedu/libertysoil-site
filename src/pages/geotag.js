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
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { isEmpty } from 'lodash';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { setGeotagPosts, addGeotag } from '../actions';
import NotFound from './not-found';
import Breadcrumbs from '../components/breadcrumbs';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import Panel from '../components/panel';
import Tag from '../components/tag';
import TagIcon from '../components/tag-icon';
import FollowTagButton from '../components/follow-tag-button';
import Icon from '../components/icon';
import LikeTagButton from '../components/like-tag-button';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { TAG_LOCATION, TAG_PLANET } from '../consts/tags';


export class GeotagPage extends Component {
  static displayName = 'GeotagPage';

  static propTypes = {
    geotag_posts: PropTypes.shape().isRequired,
    geotags: PropTypes.shape().isRequired,
    params: PropTypes.shape({
      url_name: PropTypes.string.isRequired
    })
  };

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
    return 200;
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
    const title = geotag ? geotag.name : this.props.params.url_name;

    let toolbarPrimary = [];
    let toolbarSecondary = [];

    if (!geotag) {
      return <script />;
    }

    if (!geotag.id) {
      return <NotFound/>;
    }

    let tagPosts = geotag_posts[this.props.params.url_name] || [];

    let followTriggers = {
      followTag: triggers.followGeotag,
      unfollowTag: triggers.unfollowGeotag
    };

    let likeTriggers = {
      likeTag: triggers.likeGeotag,
      unlikeTag: triggers.unlikeGeotag
    };

    if (is_logged_in) {
      toolbarSecondary = [
        <LikeTagButton
          is_logged_in={is_logged_in}
          liked_tags={current_user.liked_geotags}
          tag={this.props.params.url_name}
          triggers={likeTriggers}
          outline={true}
        />
      ];

      toolbarPrimary = [
        <div className="panel__toolbar_item-text">
          {tagPosts.length} posts
        </div>,
        <button className="button button-midi button-ligth_blue" type="button">New</button>,
        <FollowTagButton
          current_user={current_user}
          followed_tags={current_user.followed_geotags}
          tag={this.props.params.url_name}
          triggers={followTriggers}
          className="button-midi"
        />
      ];
    }

    return (
      <div>
        <Helmet title={`${geotag.name} posts on `} />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs>
              <Link title="All Geotags" to="/geotag">
                <TagIcon inactive type={TAG_PLANET} />
              </Link>
              {!isEmpty(geotag.continent) &&
                <Tag
                  inactive={geotag.type != 'Continent'}
                  name={geotag.continent.name}
                  type={TAG_LOCATION}
                  urlId={geotag.continent.url_name}
                />
              }
              {!isEmpty(geotag.country) &&
                <Tag
                  inactive={geotag.type != 'Country'}
                  name={geotag.country.name}
                  type={TAG_LOCATION}
                  urlId={geotag.country.url_name}
                />
              }
              <Tag name={geotag.name} type={TAG_LOCATION} urlId={geotag.url_name} />
            </Breadcrumbs>
          </div>
        </Header>

        <div className="page__container">
          <div className="page__caption">
            {title} <span className="page__caption_highlight">Education</span>
          </div>
          <div className="page__hero"></div>
          <div className="page__body">
            <Panel
              title={title}
              icon={<Tag size="BIG" type={TAG_LOCATION} urlId={geotag.url_name} />}
              toolbarPrimary={toolbarPrimary}
              toolbarSecondary={toolbarSecondary}
            >
              Short wikipedia description about this location will be displayed here soon.
            </Panel>
          </div>
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <div className="page__content">
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
