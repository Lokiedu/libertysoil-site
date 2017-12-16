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
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import isEqual from 'lodash/isEqual';
import { List } from 'immutable';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { POST_SORTING_TYPES } from '../consts/sorting';
import { TAG_PLANET } from '../consts/tags';
import CONTINENTS from '../consts/continents';

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import { Page, PageMain, PageBody, PageContent } from '../components/page';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import ContinentNav from '../components/continent-nav';
import Footer from '../components/footer';
import LoadableRiver from '../components/loadable-river';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import SortingFilter from '../components/filters/sorting-filter';
import TagIcon from '../components/tag-icon';

export const LOAD_MORE_LIMIT = 4;

class GeotagCloudPage extends Component {
  static displayName = 'GeotagCloudPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired
  };

  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);

    await Promise.all([
      triggers.loadGeotags({ type: 'Continent', sort: 'url_name' }),
      triggers.loadAllPosts({ ...router.location.query, tagType: 'geotag' }),
      triggers.loadGeotagCloud()
    ]);
  }

  constructor(props, ...args) {
    super(props, ...args);

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.location.query, nextProps.location.query)) {
      this.triggers.loadAllPosts({ ...nextProps.location.query, tagType: 'geotag' });
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleForceLoadPosts = async () => {
    const { river, location } = this.props;
    const query = { ...location.query, tagType: 'geotag', offset: river.size };
    const { posts } = await this.triggers.loadAllPosts(query);
    return Array.isArray(posts) && posts.length > LOAD_MORE_LIMIT;
  };

  handleAutoLoadPosts = async (isVisible) => {
    if (!isVisible) {
      return undefined;
    }

    const { river, location, ui } = this.props;
    let displayLoadMore = true;
    if (!ui.getIn(['progress', 'loadAllPostsInProgress'])) {
      const query = { ...location.query, tagType: 'geotag', offset: river.size };
      const { posts } = await this.triggers.loadAllPosts(query);
      displayLoadMore = Array.isArray(posts) && posts.length > LOAD_MORE_LIMIT;
    }

    return displayLoadMore;
  };

  render() {
    const { geotags, is_logged_in, current_user } = this.props;

    const popularCountries = this.props.geotag_cloud
      .reduce((countries, continent) => countries.concat(continent.get('geotags').toJS()), [])
      .map(urlName => geotags.get(urlName))
      .sort((a, b) => a.get('hierarchy_post_count') - b.get('hierarchy_post_count'))
      .slice(0, 4);

    const continents = this.props.geotag_cloud
      .map(continent => geotags.get(CONTINENTS[continent.get('continent_code')].url_name));

    return (
      <div>
        <Helmet title="Geotags of " />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo />
          <div className="header__breadcrumbs">
            <Breadcrumbs title="All Geotags">
              <TagIcon type={TAG_PLANET} />
            </Breadcrumbs>
          </div>
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                {/* CreatePost */}
                <LoadableRiver
                  comments={this.props.comments}
                  current_user={current_user}
                  loadMoreLimit={LOAD_MORE_LIMIT}
                  posts={this.props.posts}
                  river={this.props.river}
                  triggers={this.triggers}
                  ui={this.props.ui}
                  users={this.props.users}
                  waiting={this.props.ui.getIn(['progress', 'loadAllPostsInProgress'])}
                  onAutoLoad={this.handleAutoLoadPosts}
                  onForceLoad={this.handleForceLoadPosts}
                />
              </PageContent>
              <SidebarAlt>
                {/* Added tags */}
                <SortingFilter
                  location={this.props.location}
                  sortingTypes={POST_SORTING_TYPES}
                />
                <ContinentNav
                  countries={List(popularCountries)}
                  continents={continents}
                />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('posts'),
  state => state.get('all_posts'),
  state => state.get('users'),
  state => state.get('ui'),
  state => state.get('geotags'),
  state => state.get('geotag_cloud'),
  (current_user, comments, posts, river, users, ui, geotags, geotag_cloud) => ({
    ...current_user,
    comments,
    posts,
    river,
    users,
    ui,
    geotags,
    geotag_cloud
  })
);

export default connect(mapStateToProps)(GeotagCloudPage);
