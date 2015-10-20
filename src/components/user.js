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
import React, { Component } from 'react';
import { Link } from 'react-router';
import Gravatar from 'react-gravatar';
import moment from 'moment';

import { URL_NAMES, getUrl } from '../utils/urlGenerator';

export default class User extends Component {
  render () {
    var { user, hideAvatar, hideText, isRound, avatarSize, timestamp, timestampLink } = this.props;
    var render = {};

    let user_url = getUrl(URL_NAMES.USER, { username: user.username })

    if (!hideAvatar) {
      let avatarClassName = 'user_box__avatar';

      if (isRound) {
        avatarClassName += ' user_box__avatar-round';
      }

      render.avatar = (
        <Link to={user_url} className={avatarClassName}>
          <Gravatar md5={user.gravatarHash} size={parseInt(avatarSize, 10)} default="retro" />
        </Link>
      );
    }

    if (!hideText) {
      let name = user.username;

      if (user.more && user.more.firstName && user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }

      name = name.trim();

      if (timestamp.length > 0 && timestampLink.length > 0) {
        let timestamp_string = moment(timestamp).format('MMMM D, HH:MM');

        render.timestamp =
          <p className="user_box__text">
            <Link to={timestampLink}>
              {timestamp_string}
            </Link>
          </p>
      }

      render.text =
        <div className="user_box__body">
          <p className="user_box__name"><Link className="user_box__name link" to={user_url}>{name}</Link></p>
          {render.timestamp}
        </div>;
    }

    return (
        <div className="user_box">
          {render.avatar}
          {render.text}
        </div>
    )
  }

  static propTypes = {
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired,
      avatar: React.PropTypes.string
    }).isRequired,
    avatarSize: React.PropTypes.any.isRequired,
    hideAvatar: React.PropTypes.bool,
    isRound: React.PropTypes.bool,
    hideText: React.PropTypes.bool,
    timestamp: React.PropTypes.string,
    timestampLink: React.PropTypes.string
  }

  static defaultProps = {
    hideAvatar: false,
    hideText: false,
    isRound: false,
    avatarSize: 24,
    timestamp: '',
    timestampLink: ''
  };
}
