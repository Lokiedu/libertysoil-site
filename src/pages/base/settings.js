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
import { IndexLink } from 'react-router';
import values from 'lodash/values';

import { getUrl, URL_NAMES } from '../../utils/urlGenerator';
import { createSelector, currentUserSelector } from '../../selectors';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import { ActionsTrigger } from '../../triggers';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import Breadcrumbs from '../../components/breadcrumbs/breadcrumbs';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import Sidebar from '../../components/sidebar';
import Messages from '../../components/messages';
import SidebarAlt from '../../components/sidebarAlt';
import PageContentLink from '../../components/page-content-link';
import { UserCaption } from '../../components/page/captions';
import Avatar from '../../components/user/avatar';
import * as BioActions from '../../components/bio/actions';

class BaseSettingsPage extends React.Component {
  static displayName = 'BaseSettingsPage';

  static propTypes = {
    children: PropTypes.node,
    messages: ArrayOfMessagesPropType
  };

  static async fetchData(router, store, client) {
    const currentUserId = store.getState().getIn(['current_user', 'id']);
    const currentUserUsername = store.getState().getIn(['users', currentUserId, 'username']);
    const triggers = new ActionsTrigger(client, store.dispatch);
    await triggers.loadUserInfo(currentUserUsername);
  }

  constructor(props, ...args) {
    super(props, ...args);

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
  }

  render() {
    const {
      children,
      is_logged_in,
      current_user,
      messages
    } = this.props;

    const user = current_user.get('user');

    const name = '@'.concat(user.get('username'));

    const isBio = children && children.type.displayName === 'Connect(SettingsBioPage)';

    return (
      <div>
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo />
          <Breadcrumbs className="breadcrumbs--user" title={name}>
            <Avatar
              className="breadcrumbs__avatar"
              size={26}
              isLink={false}
              user={user}
            />
          </Breadcrumbs>
        </Header>

        <Page>
          <PageMain className="page__main">
            <PageBody>
              <Sidebar />
              <PageContent>
                <UserCaption title={isBio && "Your Bio"} user={user} />
                <div className="layout">
                  <div className="layout__grid_item layout__grid_item-fill layout__grid_item-wide">
                    {children}
                  </div>
                </div>
                <div className="layout__row">
                  <Messages
                    messages={messages}
                    removeMessage={this.triggers.removeMessage}
                  />
                </div>
              </PageContent>
              <SidebarAlt>
                <div className="aux-nav">
                  <div className="aux-nav__item">
                    <IndexLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={getUrl(URL_NAMES.SETTINGS)}
                    >
                      Your Bio
                    </IndexLink>
                  </div>
                  <div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={getUrl(URL_NAMES.CHANGE_PASSWORD)}
                      visible
                    >
                      Change Password
                    </PageContentLink>
                  </div>
                  {/*<div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={'/tools/my'}
                      visible
                    >
                      My
                    </PageContentLink>
                  </div>*/}
                  {/*<div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={'/tools/people/following'}
                      visible
                    >
                      People
                    </PageContentLink>
                  </div>*/}
                  {/*<div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={'/tools/conversations'}
                      visible
                    >
                      Conversations
                    </PageContentLink>
                  </div>*/}
                  <div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={getUrl(URL_NAMES.EMAIL_SETTINGS)}
                      visible
                    >
                      Notification Settings
                    </PageContentLink>
                  </div>
                  <div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}
                      visible
                    >
                      Followers
                    </PageContentLink>
                  </div>
                  <div className="aux-nav__item">
                    <PageContentLink
                      activeClassName="aux-nav__link--active"
                      className="aux-nav__link"
                      to={getUrl(URL_NAMES.LANGUAGE_SETTINGS)}
                      visible
                    >
                      Language
                    </PageContentLink>
                  </div>
                </div>
                {isBio &&
                  <div className="layout layout-align_center layout-wrap bio__actions">
                    {values(BioActions).map(Action => (
                      <Action
                        dispatch={this.props.dispatch}
                        key={Action.displayName}
                        triggers={this.triggers}
                        user={user}
                      />
                    ))}
                  </div>
                }
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>
        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('messages'),
  (current_user, messages, following, followers) => ({
    messages,
    following,
    followers,
    ...current_user
  })
);

export default connect(selector)(BaseSettingsPage);
