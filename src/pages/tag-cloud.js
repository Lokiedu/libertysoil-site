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

import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';

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
import TagCloud from '../components/tag-cloud';
import TagIcon from '../components/tag-icon';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { TAG_HASHTAG } from '../consts/tags';


class TagCloudPage extends Component {
  static displayName = 'TagCloudPage';

  static propTypes = {
    tag_cloud: ArrayOfHashtagsPropType.isRequired
  };

  static async fetchData(params, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.loadTagCloud();
  }

  render() {
    const {
      is_logged_in,
      current_user,
      tag_cloud
    } = this.props;

    return (
      <div>
        <Helmet title="Tags of " />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <Breadcrumbs title="All Hashtags">
            <TagIcon big type={TAG_HASHTAG} />
          </Breadcrumbs>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageBody>
              <PageContent>
                <PageCaption>Tag cloud</PageCaption>
                <div className="layout__row">
                  <TagCloud hashtags={tag_cloud} showPostCount />
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

export default connect(defaultSelector)(TagCloudPage);
