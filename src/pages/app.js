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
import { connect } from 'react-redux';
import noop from 'lodash/noop';

import { ActionsTrigger } from '../triggers';
import { INTERCOM_APP_ID } from '../config';
import createSelector from '../selectors/createSelector';

import ContextualRoutes from '../components/contextual';
import WrappedIntercom from '../components/intercom';

const GAInitializer = ga.Initializer;

export class UnwrappedApp extends React.Component {
  static contextualRoutes = ['login', 'signup'];

  static displayName = 'UnwrappedApp';

  static propTypes = {
    children: PropTypes.element.isRequired,
    location: PropTypes.shape(),
    routes: PropTypes.arrayOf(PropTypes.shape())
  };

  static defaultProps = {
    dispatch: noop,
    location: { hash: '', pathname: '', search: '' }
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

  shouldComponentUpdate(nextProps) {
    return nextProps.children !== this.props.children
      || nextProps.locale !== this.props.locale;
  }

  render() {
    const { children } = this.props;

    let gaContent;
    if (process.env.GOOGLE_ANALYTICS_ID) {
      gaContent = <GAInitializer />;
    }

    let url = '';
    if (this.props.location) {
      url = this.props.location.pathname
        .concat(this.props.location.search);
    }

    return (
      <div className="page">
        <Helmet title="" titleTemplate="%sLibertySoil.org">
          <html lang={this.props.locale} />
        </Helmet>
        {children}
        {gaContent}
        <WrappedIntercom app_id={INTERCOM_APP_ID} url={url} />
        <ContextualRoutes
          location={this.props.location}
          routes={this.props.routes}
          scope={UnwrappedApp.displayName}
        />
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => state.getIn(['ui', 'locale']),
  locale => ({ locale })
);

export default connect(mapStateToProps)(UnwrappedApp);
