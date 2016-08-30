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

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';
import { CurrentUser as CurrentUserPropType } from '../../prop-types/users';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Messages from '../../components/messages';

const BaseSuggestionsPage = ({ children, current_user, is_logged_in, messages, triggers }) => (
  <div>
    <Header current_user={current_user} is_logged_in={is_logged_in} />

    <Page className="page__container-no_sidebar">
      <PageMain>
        <PageBody>
          <PageContent>
            <Messages messages={messages} removeMessage={triggers.removeMessage} />
            <div className="paper">
              {children}
            </div>
          </PageContent>
        </PageBody>
      </PageMain>
    </Page>

    <Footer />
  </div>
);

BaseSuggestionsPage.displayName = 'BaseSuggestionsPage';

BaseSuggestionsPage.propTypes = {
  children: PropTypes.node,
  current_user: CurrentUserPropType,
  is_logged_in: PropTypes.bool.isRequired,
  messages: ArrayOfMessagesPropType,
  triggers: PropTypes.shape({})
};

export default BaseSuggestionsPage;
