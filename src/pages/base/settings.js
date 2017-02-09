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
import { Link, IndexLink } from 'react-router';
import { find, findIndex } from 'lodash';

import { Command } from '../../utils/command';
import { getUrl, URL_NAMES } from '../../utils/urlGenerator';

import { ArrayOfMessages as ArrayOfMessagesPropType } from '../../prop-types/messages';

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

export default class BaseSettingsPage extends React.Component {
  static displayName = 'BaseSettingsPage';

  static propTypes = {
    children: PropTypes.node,
    messages: ArrayOfMessagesPropType,
    triggers: PropTypes.shape({
      addError: PropTypes.func.isRequired,
      removeMessage: PropTypes.func.isRequired,
      removeAllMessages: PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.commands = [];
    this.state = {
      processing: false,
      unsaved: false
    };
  }

  processing = () => this.state.processing;

  _getNewPictures() {
    return this.head._getNewPictures();
  }

  _clearPreview() {
    this.head._clearPreview();
  }

  /**
   * Receives all commands to execute right after click on "Save" button
   * @param {Command} command  The command to execute
   */
  handleChange = (command) => {
    if (command instanceof Command) {
      const index = findIndex(this.commands, c => c.title === command.title);

      if (index >= 0) {
        this.commands[index] = command;
      } else {
        this.commands.push(command);
      }
    }

    if (find(this.commands, { status: true })) {
      this.props.triggers.removeAllMessages();
      this.setState({ unsaved: true });
    }
  };

  /**
   * Processes all active commands (command.params.status == true) received by handleChange()
   */
  handleSave = async () => {
    this.setState({ processing: true });
    let success = true;

    const processQueue = async () => {
      for (let i = this.commands.length - 1; i >= 0; --i) {
        const command = this.commands[i];

        if (command.status) {
          const result = await command.run.apply(null, command.args);

          if (result.redo) {
            ++i;
            continue;
          }

          if (result.success) {
            this.commands.splice(i, 1);
          } else {
            success = !!result.success;
          }
        }
      }
    };

    await processQueue();
    if (success) {
      this.commands = [];
    }

    this.setState({
      processing: false,
      unsaved: !success
    });
  };

  render() {
    const {
      children,
      is_logged_in,
      current_user,
      following,
      followers,
      messages,
      triggers
    } = this.props;

    const user = current_user.get('user');

    let name = user.get('username');
    if (user.getIn(['more', 'firstName']) || user.getIn(['more', 'lastName'])) {
      name = `${user.getIn(['more', 'firstName'])} ${user.getIn(['more', 'lastName'])}`;
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
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <ProfileHeader
                  current_user={current_user}
                  editable
                  followers={followers}
                  following={following}
                  ref={c => this.head = c}
                  triggers={triggers}
                  user={user}
                  onChange={this.handleChange}
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
                          <Link activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.EMAIL_SETTINGS)}>Email settings</Link>
                          <Link activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Manage Followers</Link>
                          <Link activeClassName="tabs__title-active" className="tabs__title tabs__link" to={getUrl(URL_NAMES.CHANGE_PASSWORD)}>Change password</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="layout__row">
                    <Messages
                      messages={messages}
                      removeMessage={triggers.removeMessage}
                    />
                  </div>
                  {this.state.unsaved &&
                    <div className="void">
                      <Button
                        className="button-green"
                        title="Save changes"
                        waiting={this.state.processing}
                        onClick={this.handleSave}
                      />
                    </div>
                  }
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
