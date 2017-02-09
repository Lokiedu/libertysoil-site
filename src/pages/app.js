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
import ga from 'react-google-analytics';
import Helmet from 'react-helmet';

import { ActionsTrigger } from '../triggers';
import MobileMenu from '../components/mobile-menu';

const GAInitializer = ga.Initializer;

export default class App extends React.Component {
  static displayName = 'UnwrappedApp';

  static propTypes = {
    children: PropTypes.element.isRequired
  };

  static async fetchData(router, store, client) {
    const props = store.getState();

    if (!props.get('current_user').get('id')) {
      return;
    }

    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.loadUserTags();
  }

  componentDidMount() {
    if (process.env.GOOGLE_ANALYTICS_ID) {
      ga('create', process.env.GOOGLE_ANALYTICS_ID, 'auto');
      ga('send', 'pageview');
    }
  }

  render() {
    const { children } = this.props;

    let gaContent;
    if (process.env.GOOGLE_ANALYTICS_ID) {
      gaContent = <GAInitializer />;
    }

    return (
      <div className="page">
        <Helmet title="" titleTemplate="%sLibertySoil.org" />
        {children}
        {gaContent}
        <MobileMenu />
      </div>
    );
  }
}
