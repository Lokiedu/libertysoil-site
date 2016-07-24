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
import { Link } from 'react-router';
import Gravatar from 'react-gravatar';

import { User as UserPropType } from '../../prop-types/users';

export default class Avatar extends React.Component {
  static displayName = 'Avatar';

  static propTypes = {
    className: PropTypes.string,
    isLink: PropTypes.bool,
    isRound: PropTypes.bool,
    size: PropTypes.number,
    url: PropTypes.string,
    user: UserPropType.isRequired,
    userUrl: PropTypes.string
  };

  static defaultProps = {
    isLink: false,
    isRound: true,
    size: 24
  };

  getImgUrl(url) {
    const { user } = this.props;

    let imgUrl;
    if (url) {
      imgUrl = url;
    } else if (user.more && user.more.avatar) {
      imgUrl = user.more.avatar.url;
    }

    return imgUrl;
  }

  render() {
    const {
      className,
      isLink,
      isRound,
      size,
      url,
      user,
      userUrl
    } = this.props;

    let finalSize = parseInt(size, 10);
    let finalUrl = this.getImgUrl(url);

    let avatar;
    if (finalUrl) {
      avatar = <img height={finalSize} src={finalUrl} width={finalSize} />;
    } else {
      avatar = <Gravatar default="retro" md5={user.gravatarHash} size={finalSize} />;
    }

    let cn = 'user_box__avatar';
    if (isRound) {
      cn += ' user_box__avatar-round';
    }
    if (className) {
      cn += ` ${className}`;
    }

    if (isLink) {
      return (
        <Link className={cn} to={userUrl}>
          {avatar}
        </Link>
      );
    }

    return (
      <div className={cn}>
        {avatar}
      </div>
    );
  }
}
