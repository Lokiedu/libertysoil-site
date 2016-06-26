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

export default class FollowButton extends React.Component {
  static displayName = 'FollowButton';
  static propTypes = {
    active_user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    }),
    following: React.PropTypes.arrayOf(React.PropTypes.string),
    triggers: React.PropTypes.shape({
      followUser: React.PropTypes.func.isRequired,
      unfollowUser: React.PropTypes.func.isRequired
    }),
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    })
  };

  followUser = (event) => {
    event.preventDefault();
    this.props.triggers.followUser(this.props.user);
  }

  unfollowUser = (event) => {
    event.preventDefault();
    this.props.triggers.unfollowUser(this.props.user);
  }

  render() {
    if (!this.props.active_user) {
      return null;  // anonymous
    }

    const user = this.props.user;
    const active_user = this.props.active_user;

    if (user.id === active_user.id) {
      return null;  // do not allow to follow one's self
    }

    const is_followed = (this.props.following.indexOf(user.id) != -1);

    if (is_followed) {
      return <button className="button button-wide button-yellow" onClick={this.unfollowUser}>Following</button>;
    }

    return <button className="button button-wide button-green" onClick={this.followUser}>Follow</button>;
  }
}
