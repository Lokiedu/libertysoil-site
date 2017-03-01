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
import { Map as ImmutableMap } from 'immutable';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

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
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import SearchSection from '../components/search/section';

class SearchPage extends Component {
  static displayName = 'SearchPage';

  static propTypes = {
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired
  };

  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.search(router.location.query.q);
  }

  render() {
    const {
      is_logged_in,
      current_user,
      search
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Helmet title="Search of " />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs title="Search" />
          </div>
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <PageCaption>Search</PageCaption>
                <div>
                  {search.get('results')
                    .map((items, type) =>
                      ImmutableMap({ type, items })
                    )
                    .toList()
                    .map(section =>
                      <SearchSection
                        current_user={current_user}
                        items={section.get('items')}
                        key={section.get('type')}
                        triggers={triggers}
                        type={section.get('type')}
                      />
                    )
                  }
                </div>
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
  [currentUserSelector, state => state.get('search')],
  (current_user, search) => ({
    ...current_user,
    search
  })
);

export default connect(selector)(SearchPage);
