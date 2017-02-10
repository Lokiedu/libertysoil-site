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
import { take } from 'lodash';

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
import TagIcon from '../components/tag-icon';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_PLANET } from '../consts/tags';
import ListItem from '../components/list-item';


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

    const search_response_object = search.toJSON();

    let tags = [];
    for (const section of Object.keys(search_response_object.results)) {
      tags = tags.concat(
        search_response_object.results[section].map(tag =>
          ({ tagType: section, ...tag })
        )
      );
    }

    tags = take(tags, 100);

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
                  {tags.map((tag, i) => {
                    let icon, name, url;

                    switch (tag.tagType) {
                      case 'geotags': {
                        icon = <TagIcon big type={TAG_LOCATION} />;
                        name = tag.name;
                        url = `/geo/${tag.url_name}`;
                        break;
                      }
                      case 'hashtags': {
                        icon = <TagIcon big type={TAG_HASHTAG} />;
                        name = tag.name;
                        url = `/tag/${tag.name}`;
                        break;
                      }
                      case 'schools': {
                        icon = <TagIcon big type={TAG_SCHOOL} />;
                        name = tag.name;
                        url = `/s/${tag.url_name}`;
                        break;
                      }
                      case 'posts': {
                        icon = <TagIcon big type={TAG_PLANET} />;  // FIXME: need a proper icon
                        name = tag.more.pageTitle;
                        url = `/post/${tag.id}`;
                        break;
                      }
                      default:
                        console.log(`Unhandled search result type: ${tag.tagType}`);  // eslint-disable-line no-console
                        return null;
                    }

                    return (
                      <Link key={i} to={url}>
                        <ListItem icon={icon}>
                          {name}
                        </ListItem>
                      </Link>
                    );
                  })}
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
