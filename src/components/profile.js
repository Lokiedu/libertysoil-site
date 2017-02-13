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
import { pick } from 'lodash';

import {
  mapOf as mapOfPropType,
  uuid4 as uuid4PropType
} from '../prop-types/common';
import {
  ArrayOfUsersId as ArrayOfUsersIdPropType,
  CurrentUser as CurrentUserPropType,
  User as UserPropType
} from '../prop-types/users';
import { getUrl, URL_NAMES } from '../utils/urlGenerator';
import { AVATAR_SIZE, PROFILE_HEADER_SIZE } from '../consts/profileConstants';

import User from './user';
import FollowButton from './follow-button';
import UpdatePicture from './update-picture/update-picture';


export default class ProfileHeader extends React.Component {
  static displayName = 'ProfileHeader';

  static defaultProps = {
    onChange: () => {}
  };

  static propTypes = {
    current_user: CurrentUserPropType,
    followers: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType),
    following: mapOfPropType(uuid4PropType, ArrayOfUsersIdPropType),
    onChange: PropTypes.func,
    triggers: PropTypes.shape({
      addError: PropTypes.func.isRequired,
      updateUserInfo: PropTypes.func.isRequired,
      uploadPicture: PropTypes.func.isRequired
    }).isRequired,
    user: UserPropType.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      avatar: null,
      head_pic: null
    };
  }

  unsaved = false;

  _getNewPictures() {
    const pictures = {};
    if (this.state.avatar) {
      pictures.avatar = this.state.avatar.production;
    }
    if (this.state.head_pic) {
      pictures.head_pic = this.state.head_pic.production;
    }

    return pictures;
  }

  _clearPreview() {
    this.setState({ avatar: null, head_pic: null });
  }

  saveAll = async () => {
    return Promise.all(['avatar', 'head_pic'].map(this.handleSave));
  }

  handleSave = async (name) => {
    const { triggers } = this.props;
    const processedPicture = {};
    const pictures = this._getNewPictures();

    let success = false;
    if (!(name in pictures)) {
      return { success };
    }

    try {
      processedPicture[name] = await triggers.uploadPicture({ ...pictures[name] });

      success = await triggers.updateUserInfo({ more: { ...processedPicture } });
    } catch (e) {
      await triggers.addError(e.message);
      success = false;
    }

    return { success };
  };

  addAvatar = async ({ production, preview }) => {
    if (production) {
      const _production = {
        picture: production.picture,
        crop: pick(production.crop, ['left', 'top', 'right', 'bottom'])
      };

      _production.resize = { width: AVATAR_SIZE.width, height: AVATAR_SIZE.height };

      this.setState({ avatar: { production: _production, preview } });
    } else {
      this.setState({ avatar: { production: null, preview: null } });
    }

    this.props.onChange();
  };

  addHeaderPicture = async ({ production, preview }) => {
    if (production) {
      const _production = { picture: production.picture };

      // properties assign order is important
      _production.crop = pick(production.crop, ['left', 'top', 'right', 'bottom']);

      if (production.crop.width > PROFILE_HEADER_SIZE.BIG.width) {
        _production.scale = { wRatio: PROFILE_HEADER_SIZE.BIG.width / production.crop.width };
      } else {
        _production.scale = { wRatio: PROFILE_HEADER_SIZE.NORMAL.width / production.crop.width };
      }

      this.setState({ head_pic: { production: _production, preview } });
    } else {
      this.setState({ head_pic: { production: null, preview: null } });
    }

    this.props.onChange();
  };

  render() {
    const {
      user,
      current_user,
      editable,
      following,
      followers
    } = this.props;

    const currentUserFollowing = following.get(current_user.get('id'));
    const userFollowing = following.get(user.get('id'));
    const userFollowers = followers.get(user.get('id'));
    const loggedIn = !!current_user.get('id');
    const notCurrentUser = current_user.get('id') != user.get('id');

    let picture = user.getIn(['more', 'head_pic', 'url']) || '/assets/d18659acda9afc3dea60b49d71d689ae.jpg';
    let name = user.get('username');
    const summary = user.getIn(['more', 'summary']) || '';

    let modalName = <span className="font-bold">{name}</span>;

    if (user.getIn(['more', 'firstName']) || user.getIn(['more', 'lastName'])) {
      name = `${user.getIn(['more', 'firstName'])} ${user.getIn(['more', 'lastName'])}`;
      modalName = [
        <span className="font-bold" key="modalName">{name}</span>,
        ` (${user.get('username')})`
      ];
    }

    if (this.state.head_pic) {
      picture = this.state.head_pic.preview.url;
    }

    let avatarPreview;
    if (this.state.avatar) {
      avatarPreview = this.state.avatar.preview;
    }

    let followingCount;
    let followersCount;

    if (userFollowing && !userFollowing.isEmpty()) {
      // if anonym user, then do not show "Manage followers" links next to follow counters
      if (!loggedIn || notCurrentUser) {
        followingCount = (
          <div>
            {userFollowing.size}<br />
            Following
          </div>
        );
      } else {
        followingCount = (
          <div>
            {userFollowing.size}<br />
            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Following</Link>
          </div>
        );
      }
    }

    if (userFollowers && !userFollowers.isEmpty()) {
      // if anonym user, then do not show "Manage followers" too
      if (!loggedIn || notCurrentUser) {
        followersCount = (
          <div>
            {userFollowers.size}<br />
            Followers
          </div>
        );
      } else {
        followersCount = (
          <div>
            {userFollowers.size}<br />
            <Link to={getUrl(URL_NAMES.MANAGE_FOLLOWERS)}>Followers</Link>
          </div>
        );
      }
    }

    name = name.trim();

    return (
      <div className="profile" ref={c => this.root = c} style={{ backgroundImage: `url('${picture}')` }}>
        <div className="profile__body">
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <User
                  avatar={{ url: avatarPreview && avatarPreview.url, size: 120, isRound: true }}
                  avatarEditor={editable ? { flexible: false, onUpdateAvatar: this.addAvatar } : false}
                  isLink={!editable}
                  text={{ hide: true }}
                  user={user}
                />
              </div>
              {editable &&
                <div className="layout__grid_item layout__grid_item-wide layout-align_right update_picture__container">
                  <UpdatePicture
                    flexible
                    limits={{ min: PROFILE_HEADER_SIZE.MIN, max: PROFILE_HEADER_SIZE.BIG }}
                    preview={PROFILE_HEADER_SIZE.PREVIEW}
                    what="profile background"
                    where={modalName}
                    onSubmit={this.addHeaderPicture}
                  />
                </div>
              }
            </div>
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
                <FollowButton
                  active_user={current_user}
                  following={currentUserFollowing}
                  triggers={this.props.triggers}
                  user={user}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
