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
import PropTypes from 'prop-types';

import React from 'react';
import classNames from 'classnames';

import BasicRiverItem from '../river/theme/basic';
import MenuItem from '../menu-item';
import Time from '../time';
import User from '../user';

export default class PictureChangePost extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func
  };

  static defaultProps = {
    onDelete: () => {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleDelete = () => {
    this.props.onDelete(this.props.post, this.props.author);
  };

  render() {
    const { author, current_user, post } = this.props;

    let pictureType;
    if (post.get('type') === 'avatar') {
      pictureType = 'user';
    } else {
      pictureType = 'profile background';
    }

    const isCurrentUser = current_user.get('id') === author.get('id');

    return (
      <BasicRiverItem
        className={classNames(
          'river-item--type_text',
          'bio__river-item--type_image-change',
          { 'river-item--space_right': !isCurrentUser }
        )}
        icon={
          <div className="bio__icon bio__icon--bordered">
            <User
              avatar={{ isRound: false, size: 26 }}
              text={{ hide: true }}
              user={author}
            />
          </div>
        }
        menuItems={isCurrentUser && [
          <MenuItem
            className="menu__item--theme_new"
            key="delete"
            onClick={this.handleDelete}
          >
            Delete
          </MenuItem>
        ]}
      >
        <div className="layout bio__informer-text bio__informer-text--note_blue">
          <img className="bio__post-image" src={post.getIn(['more', 'url'])} />
          <div className="bio__text">
            New {pictureType} picture added on&nbsp;
            <Time className="font-bold" format="%A" timestamp={post.get('created_at')} />&nbsp;
            <Time format="%Y.%m.%d, %H:%M" timestamp={post.get('created_at')} />
          </div>
        </div>
      </BasicRiverItem>
    );
  }
}
