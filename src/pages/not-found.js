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
import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import { defaultSelector } from '../selectors';
import Header from '../components/header';
import Sidebar from '../components/sidebar';


class NotFound extends React.Component {
  render() {
    const {
      is_logged_in,
      current_user
    } = this.props;
    let pageClassName = null;

    if (!is_logged_in) {
      pageClassName = 'page__container-no_sidebar';
    }

    return (
      <div>
        <Helmet title="Page not found at " />
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />

          <Page className={pageClassName}>
            <Sidebar current_user={current_user} />
            <PageMain>
              <PageBody>
                <PageContent>
                  <section className="box">
                    <div className="box__title">
                      <p><strong>Page Not Found</strong></p>
                    </div>
                  </section>
                </PageContent>
              </PageBody>
            </PageMain>
          </Page>
      </div>
    );
  }
}

export default connect(defaultSelector)(NotFound);
