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

import { MapOfGeotags as MapOfGeotagsPropType } from '../prop-types/geotags';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
} from '../components/page';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import Footer from '../components/footer';
import Sidebar from '../components/sidebar';
import TagIcon from '../components/tag-icon';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { TAG_PLANET } from '../consts/tags';
import Continent from '../components/continent';

class GeotagCloudPage extends Component {
  static displayName = 'GeotagCloudPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    geotags: MapOfGeotagsPropType.isRequired,
    is_logged_in: PropTypes.bool.isRequired
  };

  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.loadGeotagCloud();
  }

  render() {
    const {
      is_logged_in,
      current_user,
      geotags,
      geotag_cloud
    } = this.props;

    const geotagsByContinents = geotag_cloud.map(continent => (
      continent.set('geotags', geotags.map(urlName => geotags.get(urlName)))
    ));

    return (
      <div>
        <Helmet title="Geotags of " />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs title="All Geotags">
              <TagIcon big type={TAG_PLANET} />
            </Breadcrumbs>
          </div>
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <PageCaption>Geotag cloud</PageCaption>
                {
                  geotagsByContinents.map(continent => (
                    <Continent
                      code={continent.get('continent_code')}
                      count={continent.get('geotag_count')}
                      geotags={continent.get('geotags')}
                      key={continent.get('continent_code')}
                    />
                  ))
                }
              </PageContent>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('geotags'),
  state => state.get('geotag_cloud'),
  (current_user, geotags, geotag_cloud) => ({
    geotags,
    geotag_cloud,
    ...current_user
  })
);

export default connect(selector)(GeotagCloudPage);
