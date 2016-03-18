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

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Messages from '../../components/messages';

export default class BaseSuggestionsPage extends React.Component {
  static displayName = 'BaseSuggestionsPage';

  render () {
    const {
      children,
      is_logged_in,
      current_user,
      messages,
      triggers
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

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

        <Footer/>
      </div>
    );
  }
}
