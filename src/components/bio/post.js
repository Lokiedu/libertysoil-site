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
/* eslint react/no-danger: 0 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

import BasicRiverItem from '../river/theme/basic';
import RiverItemCreateForm from '../river/type/text/create-form';
import MenuItem from '../menu-item';
import Time from '../time';
import User from '../user';

export default class ProfilePost extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func
  };

  static defaultProps = {
    onDelete: () => {},
    onUpdate: () => {}
  };

  constructor(...args) {
    super(...args);
    this.state = {
      isEditing: false,
      isWaiting: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state;
  }

  handleDelete = () => {
    this.props.onDelete(this.props.post, this.props.author);
  };

  handleToggleEdit = () => {
    this.setState({
      isEditing: !this.state.isEditing
    });
  };

  handleUpdate = async (text) => {
    return await this.props.onUpdate(
      this.props.post.get('id'),
      text
    );
  };

  render() {
    const { author, current_user, post, hideAvatar } = this.props;

    if (this.state.isEditing) {
      return (
        <RiverItemCreateForm
          className="bio__create-post-form"
          icon={[
            <div className="bio__timestamp bio__timestamp--disappearing" key="timestamp">
              <Time format="%Y.%m.%d" timestamp={post.get('updated_at')} />
            </div>,
            <div className="bio__icon" key="icon">
              <User
                avatar={{ isRound: false, size: 26 }}
                text={{ hide: true }}
                user={current_user.get('user')}
              />
            </div>
          ]}
          input={{
            autoFocus: true,
            className: 'bio__post--type_text',
            defaultValue: post.get('text'),
            placeholder: ''
          }}
          submit={{
            className: 'button-wide bio__button',
            color: 'dark_blue',
            title: 'Update'
          }}
          onCancel={this.handleToggleEdit}
          onSubmit={this.handleUpdate}
        />
      );
    }

    const isCurrentUser = current_user.get('id') === author.get('id');

    return (
      <BasicRiverItem
        className={classNames('river-item--type_text', {
          'river-item--space-right': !isCurrentUser
        })}
        icon={[
          <div className="bio__timestamp bio__timestamp--disappearing" key="timestamp">
            <Time format="%Y.%m.%d" timestamp={post.get('updated_at')} />
          </div>,
          <div className="bio__icon bio__icon--bordered" key="icon">
            {!hideAvatar &&
              <User
                avatar={{ isRound: false, size: 26 }}
                text={{ hide: true }}
                user={author}
              />
            }
          </div>
        ]}
        menuItems={isCurrentUser && [
          <MenuItem
            className="menu__item--theme_new"
            key="delete"
            onClick={this.handleDelete}
          >
            Delete
          </MenuItem>,
          <MenuItem
            className="menu__item--theme_new"
            key="edit"
            onClick={this.handleToggleEdit}
          >
            Edit
          </MenuItem>
        ]}
      >
        <div
          className="bio__post--type_text"
          dangerouslySetInnerHTML={{ __html: post.get('html') || post.get('text') }}
        />
      </BasicRiverItem>
    );
  }
}
