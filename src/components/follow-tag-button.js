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
import PropTypes from 'prop-types';

import React from 'react';
import ga from 'react-google-analytics';
import { omit } from 'lodash';

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

// Statuses for the progress indication.
const STATUS_NOT_TOUCHED = 'STATUS_NOT_TOUCHED';
const STATUS_FOLLOWING = 'STATUS_FOLLOWING';
const STATUS_JUST_FOLLOWED = 'STATUS_JUST_FOLLOWED';
const STATUS_UNFOLLOWING = 'STATUS_UNFOLLOWING';
const STATUS_JUST_UNFOLLOWED = 'STATUS_JUST_UNFOLLOWED';

/**
 * Universal component to use in the TagPage, SchoolPage components.
 */
export default class FollowTagButton extends React.Component {
  static displayName = 'FollowButton';
  static propTypes = {
    current_user: CurrentUserPropType,
    followed_tags: PropTypes.shape({}),
    tag: PropTypes.string,
    triggers: PropTypes.shape({
      followTag: PropTypes.func.isRequired,
      unfollowTag: PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      status: STATUS_NOT_TOUCHED
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      this.setState({
        status: STATUS_NOT_TOUCHED
      });
    }
  }

  _followTag = (event) => {
    event.preventDefault();

    this.setState({
      status: STATUS_FOLLOWING
    });

    this.props.triggers.followTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_FOLLOWED
      });
      ga('send', 'event', 'Tags', 'Follow', this.props.tag);
    });
  };

  _unfollowTag = (event) => {
    event.preventDefault();

    this.setState({
      status: STATUS_UNFOLLOWING
    });

    this.props.triggers.unfollowTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_UNFOLLOWED
      });
    });
  };

  render() {
    const {
      className = '',
      current_user,
      followed_tags,
      ...props
    } = this.props;
    const status = this.state.status;

    if (!current_user) {
      return null;
    }

    const buttonProps = omit(props, Object.keys(FollowTagButton.propTypes));

    // If followTag or unfollowTag was performed
    if (status !== STATUS_NOT_TOUCHED) {
      switch (status) {
        case STATUS_FOLLOWING:
          return <button {...buttonProps} className={`button button-green ${className}`} type="button">Following...</button>;
        case STATUS_UNFOLLOWING:
          return <button {...buttonProps} className={`button button-green ${className}`} type="button">Unfollowing...</button>;
        case STATUS_JUST_FOLLOWED:
          return <button {...buttonProps} className={`button button-yellow ${className}`} type="button" onClick={this._unfollowTag}>Followed!</button>;
        case STATUS_JUST_UNFOLLOWED:
          return <button {...buttonProps} className={`button button-green ${className}`} type="button" onClick={this._followTag}>Unfollowed!</button>;
        default:
          return null;
      }
    } else {
      const isFollowed = followed_tags.has(this.props.tag);

      if (isFollowed) {
        return <button {...buttonProps} className={`button button-yellow ${className}`} type="button" onClick={this._unfollowTag}>Following</button>;
      } else {  // eslint-disable-line no-else-return
        return <button {...buttonProps} className={`button button-red ${className}`} type="button" onClick={this._followTag}>Follow</button>;
      }
    }
  }
}
