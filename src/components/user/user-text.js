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

import { User as UserPropType } from '../../prop-types/users';

export default class UserText extends React.Component {
  static displayName = 'UserText';

  static propTypes = {
    isLink: PropTypes.bool,
    user: UserPropType.isRequired,
    userUrl: PropTypes.string
  };

  static defaultProps = {
    isLink: false
  };

  getName = () => {
    const { user } = this.props;
    let name = user.username;

    if (user.more && user.more.firstName && user.more.lastName) {
      name = `${user.more.firstName} ${user.more.lastName}`;
    }

    return name.trim();
  };

  render() {
    const {
      isLink,
      userUrl
    } = this.props;

    let name = this.getName();

    if (isLink) {
      console.log(userUrl);
      name = <Link className="link" to={userUrl}>{name}</Link>;
    }

    return (
      <div className="user_box__body">
        <p className="user_box__name">
          {name}
        </p>
      </div>
    );
  }
}
