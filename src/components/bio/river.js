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
import { Link } from 'react-router';
import isUndefined from 'lodash/isUndefined';

import { getName } from '../../utils/user';
import { PROFILE_POST_TYPES as t } from '../../consts/postTypeConstants';
import BasicRiverItem from '../river/theme/basic';
import { OldIcon as Icon } from '../icon';
import Logo from '../logo';
import Time from '../time';
import User from '../user';
import ProfilePost from './post';
import PictureChangePost from './picture-change-post';

const SIGNUP_ICON_SIZE = { inner: 'lm', outer: 's' };

const SignUpIcon = ({ user }) => (
  <div className="bio__icon--type_signup layout layout-align_center layout-align_vertical">
    <User
      avatar={SignUpIcon.avatarConfig}
      text={SignUpIcon.userTextConfig}
      user={user}
    />
    <Icon
      color="gray"
      icon="arrow-right"
      pack="fa"
      size={SIGNUP_ICON_SIZE}
    />
    <Logo isLink={false} />
  </div>
);
SignUpIcon.avatarConfig = {
  isRound: false, size: 26
};
SignUpIcon.userTextConfig = {
  hide: true
};

const ProfilePostsRiver = (props) => {
  const { river } = props;
  if (isUndefined(river)) {
    return null;
  }

  const { author, current_user, onDelete, onUpdate, posts } = props;
  const postsWithData = river.map(id => posts.get(id));

  return (
    <div className="bio__river">
      {postsWithData.map(post => {
        let item = null;
        switch (post.get('type')) {
          case t.PROFILE_TEXT: {
            item = (
              <ProfilePost
                author={author}
                current_user={current_user}
                post={post}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            );
            break;
          }
          case t.PROFILE_PIC_CHANGE:
          case t.USER_PIC_CHANGE: {
            item = (
              <PictureChangePost
                author={author}
                current_user={current_user}
                post={post}
                onDelete={onDelete}
              />
            );
            break;
          }
        }

        if (item) {
          return (
            <div className="bio__river-item" key={post.get('id')}>
              {item}
            </div>
          );
        }

        return item;
      })}
      {!props.hasMore &&
        <BasicRiverItem
          className="river-item--type_text bio__river-item bio__river-item--type_signup"
          icon={<SignUpIcon user={author} />}
        >
          <div>
            <Link
              className="color-dark_blue bio__link"
              to={'/user/'.concat(author.get('username'))}
            >
              {getName(author)}
            </Link> joined LibertySoil.org!
            <div className="bio__timestamp">
              <Time className="font-bold" format="%A" timestamp={author.get('created_at')} />&nbsp;
              <Time format="%Y.%m.%d, %H:%M" timestamp={author.get('created_at')} />
            </div>
          </div>
        </BasicRiverItem>
      }
    </div>
  );
};

ProfilePostsRiver.displayName = 'ProfilePostsRiver';

export default ProfilePostsRiver;
