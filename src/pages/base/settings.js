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
import { Link, IndexLink } from 'react-router';

import { getUrl, URL_NAMES } from '../../utils/urlGenerator';

import Header from '../../components/header';
import Footer from '../../components/footer';
import ProfileHeader from '../../components/profile';
import Sidebar from '../../components/sidebar';
import Messages from '../../components/messages';

export default class BaseSettingsPage extends React.Component {
  static displayName = 'BaseSettingsPage';

  render () {
    const {
      onSave,
      children,
      is_logged_in,
      current_user,
      following,
      followers,
      messages,
      triggers
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <ProfileHeader
                user={current_user.user}
                current_user={current_user}
                following={following}
                followers={followers}
                editable={true}
                updateAvatarTrigger={triggers.updateAvatar}
                />
              <div className="page__content page__content-spacing">
                <div className="layout__row layout-small">
                  <div className="layout__grid tabs">
                    <div className="layout__grid_item"><IndexLink to={getUrl(URL_NAMES.SETTINGS)} activeClassName="tabs__link-active" className="tabs__link">About</IndexLink></div>
                    <div className="layout__grid_item"><Link to={getUrl(URL_NAMES.CHANGE_PASSWORD)} activeClassName="tabs__link-active" className="tabs__link">Change password</Link></div>
                  </div>
                </div>
                <div className="paper layout">
                  <div className="layout__grid_item layout__grid_item-fill layout__grid_item-wide">
                      {children}
                  </div>
                  <div className="layout-normal layout__grid_item layout__grid_item-fill page__content_sidebar">
                    <div className="tabs tabs-vertical">
                      <IndexLink to={getUrl(URL_NAMES.SETTINGS)} activeClassName="tabs__link-active" className="tabs__link">Basic info</IndexLink>
                      <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)} activeClassName="tabs__link-active" className="tabs__link">Manage Followers</Link>
                      <Link to={getUrl(URL_NAMES.CHANGE_PASSWORD)} activeClassName="tabs__link-active" className="tabs__link">Change password</Link>
                    </div>
                  </div>
                </div>
                <div className="void">
                  <span className="button button-green action" onClick={onSave}>Save changes</span>
                </div>
                <Messages messages={messages} removeMessage={triggers.removeMessage}/>
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}
