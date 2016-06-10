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
import React from 'react';
import { Link, IndexLink } from 'react-router';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import Button from '../../components/button';
import Breadcrumbs from '../../components/breadcrumbs/breadcrumbs';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import ProfileHeader from '../../components/profile';
import User from '../../components/user';
import Sidebar from '../../components/sidebar';
import Messages from '../../components/messages';
import { getUrl, URL_NAMES } from '../../utils/urlGenerator';

export default class BaseSettingsPage extends React.Component {
  static displayName = 'BaseSettingsPage';

  static defaultProps = {
    onSave: false
  }

  _getNewPictures() {
    return this.head._getNewPictures();
  }

  _clearPreview() {
    this.head._clearPreview();
  }

  render() {
    const {
      onSave,
      children,
      is_logged_in,
      current_user,
      following,
      followers,
      messages,
      triggers,
      processing
    } = this.props;

    const user = current_user.user;

    let name = user.username;
    if (user.more && (user.more.firstName || user.more.lastName)) {
      name = `${user.more.firstName} ${user.more.lastName}`;
    }

    let saveButton;
    if (onSave) {
      saveButton = (
        <div className="void">
          <Button className="button-green" title="Save changes" waiting={processing} onClick={onSave} />
        </div>
      );
    }

    return (
      <div>
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs title={name}>
              <div className="user_box__avatar user_box__avatar-round">
                <User
                  avatar={{ size: 36, isRound: true }}
                  isLink={false}
                  text={{ hide: true }}
                  user={user}
                />
              </div>
            </Breadcrumbs>
          </div>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain>
            <PageBody>
              <PageContent>
                <ProfileHeader
                  current_user={current_user}
                  editable
                  followers={followers}
                  following={following}
                  ref={c => this.head = c}
                  user={current_user.user}
                />
                <div className="page__content page__content-spacing">
                  <div className="layout__row layout-small">
                    <div className="layout__grid layout__space tabs">
                      <div className="layout__grid_item">
                        <IndexLink activeClassName="tabs__title-active" className="tabs__title tabs__title-gray tabs__link button button-midi" to={getUrl(URL_NAMES.SETTINGS)}>About</IndexLink>
                      </div>
                      <div className="layout__grid_item">
                        <Link activeClassName="tabs__title-active" className="tabs__title tabs__title-gray tabs__link button button-midi" to={getUrl(URL_NAMES.CHANGE_PASSWORD)}>Change password</Link>
                      </div>
                    </div>
                  </div>
                  <div className="paper layout">
                    <div className="layout__grid_item layout__grid_item-fill layout__grid_item-wide">
                        {children}
                    </div>
                    <div className="layout-normal layout__grid_item layout__grid_item-fill page__content_sidebar">
                      <div className="tabs tabs-theme_settings">
                        <div className="tabs__menu">
                          <IndexLink activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.SETTINGS)}>Basic info</IndexLink>
                          <Link activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Manage Followers</Link>
                          <Link activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.CHANGE_PASSWORD)}>Change password</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  {saveButton}
                  <Messages messages={messages} removeMessage={triggers.removeMessage} />
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
