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

import User from './user';
import FollowButton from './follow-button';
import { Link } from 'react-router';

import { getUrl, URL_NAMES } from '../utils/urlGenerator';

export default class ProfileHeader extends React.Component {
  static displayName = 'ProfileHeader'

  render () {
    const { user, current_user, i_am_following, following, followers } = this.props;
    let name = user.username;
    let summary = '';
    let followingCount;
    let followersCount;

    if (user.more) {
      if (user.more.firstName || user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }

      if (user.more.summary) {
        summary = user.more.summary;
      }
    }

    if (following && following[user.id]) {
      if (current_user.id != user.id) {
        followingCount = (
          <div>
            {following[user.id].length}<br />
            Following
          </div>
        );
      } else {
        followingCount = (
          <div>
            {following[user.id].length}<br />
            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Following</Link>
          </div>
        );
      }

    }

    if (followers && followers[user.id]) {
      if (current_user.id != user.id) {
        followersCount = (
          <div>
            {followers[user.id].length}<br />
            Followers
          </div>
        );
      } else {
        followersCount = (
          <div>
            {followers[user.id].length}<br />

            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Followers</Link>
          </div>
        );
      }

    }

    name = name.trim();

    return (
      <div className="profile">
        <div className="profile__body">
          <div className="layout__row">
            <User user={user} avatarSize="120" isRound={true} hideText={true} />
          </div>
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="profile__title">{name}</div>
                <div className="profile__summary">{summary}</div>
              </div>
              <div className="layout__grid_item">
                {followingCount}
              </div>
              <div className="layout__grid_item">
                {followersCount}
              </div>
              <div className="layout__grid_item">
                <FollowButton active_user={current_user} user={user} following={i_am_following} triggers={this.props.triggers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
