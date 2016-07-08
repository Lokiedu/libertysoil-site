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
import Helmet from 'react-helmet';

import { MapOfGeotags as MapOfGeotagsPropType } from '../prop-types/geotags';

import {
  Page,
  PageMain,
  PageCaption,
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
import { defaultSelector } from '../selectors';
import { TAG_PLANET } from '../consts/tags';
import Continent from '../components/continent';

class GeotagCloudPage extends Component {
  static displayName = 'GeotagCloudPage';

  static propTypes = {
    geotags: MapOfGeotagsPropType.isRequired
  };

  static async fetchData(params, store, client) {
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

    const geotagsByContinents = geotag_cloud.map(continent => {
      return Object.assign(continent, {
        geotags: continent.geotags.map(urlName => geotags[urlName])
      });
    });

    return (
      <div>
        <Helmet title="Geotags of " />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs title="All Geotags">
              <TagIcon big type={TAG_PLANET} />
            </Breadcrumbs>
          </div>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageBody>
              <PageContent>
                <PageCaption>Geotag cloud</PageCaption>
                {
                  geotagsByContinents.map(continent => (
                    <Continent
                      code={continent.continent_code}
                      count={continent.geotag_count}
                      geotags={continent.geotags}
                      key={continent.continent_code}
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

export default connect(defaultSelector)(GeotagCloudPage);
