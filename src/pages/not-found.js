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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import { createSelector, currentUserSelector } from '../selectors';
import Header from '../components/header';
import Sidebar from '../components/sidebar';


const NotFound = ({ is_logged_in, current_user }) => (
  <div>
    <Helmet title="Page not found at " />
    <Header current_user={current_user} is_logged_in={is_logged_in} />
    <Page>
      <PageMain>
        <PageBody>
          <Sidebar />
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

NotFound.displayName = 'NotFound';

NotFound.propTypes = {
  current_user: CurrentUserPropType,
  is_logged_in: PropTypes.bool.isRequired
};

const selector = createSelector(
  currentUserSelector,
  (current_user) => ({ ...current_user })
);

export default connect(selector)(NotFound);
