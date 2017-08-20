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
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { OldIcon as Icon } from '../icon';
import { ICON_SIZE } from './index';

export default class WelcomeGuestTopMessage extends React.Component {
  static displayName = 'WelcomeGuestTopMessage';

  static propTypes = {
    onHomeClick: PropTypes.func,
    onMessageClose: PropTypes.func
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className="top-message layout layout-align_center">
        <div className="top-message__container layout-align_justify">
          <div className="layout">
            <div>
              <Icon
                className="action top-menu__icon"
                icon="home"
                pack="fa"
                size={ICON_SIZE}
                onClick={this.props.onHomeClick}
              />
            </div>
            <div>
              <h3 className="top-message__header">Welcome to LibertySoil, education change network</h3>
              <p className="top-message__body">
                We are a professional community connecting people involved in education
                reform worldwide. Crowdsourcing of school design data to help best practices
                spread faster is the main purpose of this site.
                Please <Link className="font--underlined clean-hover" to="/auth#register">sign up</Link> or <Link className="font--underlined clean-hover" to="/auth">log in</Link>.
              </p>
            </div>
          </div>
          <div>
            <Icon
              className="action"
              icon="close"
              pack="fa"
              size={ICON_SIZE}
              onClick={this.props.onMessageClose}
            />
          </div>
        </div>
      </div>
    );
  }
}
