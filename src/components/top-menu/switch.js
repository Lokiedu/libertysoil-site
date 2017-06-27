/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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

import WelcomeGuestTopMessage from './welcome-guest';
import WelcomeUserTopMessage from './welcome-user';
import WelcomeFirstLoginTopMessage from './welcome-first-login';

export default class TopMessageSwitch extends React.Component {
  static displayName = 'TopMessageSwitch';

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { message, ...props } = this.props;

    switch (message[1].get('message')) {
      case 'welcome-guest':
        return (
          <WelcomeGuestTopMessage {...props} />
        );
      case 'welcome-user':
        return (
          <WelcomeUserTopMessage {...props} />
        );
      case 'welcome-first-login':
        return (
          <WelcomeFirstLoginTopMessage {...props} />
        );
      default:
        return false;
    }
  }
}
