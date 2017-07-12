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
import ga from 'react-google-analytics';
import { omit } from 'lodash';

import { OldIcon as Icon } from './icon';

const ICON_SIZE = { inner: 'lm', outer: 'm' };

/**
 * Universal component to use in the TagPage, SchoolPage, GeotagPage components.
 */
export default class LikeTagButton extends React.Component {
  static displayName = 'LikeTagButton';

  static propTypes = {
    hashtag: PropTypes.string,
    is_logged_in: PropTypes.bool.isRequired,
    liked_tags: PropTypes.shape({}),
    tag: PropTypes.string,
    triggers: PropTypes.shape({
      likeTag: PropTypes.func.isRequired,
      unlikeTag: PropTypes.func.isRequired
    })
  };

  _toggleLike = () => {
    if (!this.props.is_logged_in) {
      alert('Please log in!');
      return;
    }

    if (this._isLiked()) {
      this.props.triggers.unlikeTag(this.props.tag);
    } else {
      this.props.triggers.likeTag(this.props.tag).then(() => {
        ga('send', 'event', 'Tags', 'Like', this.props.tag);
      });
    }
  };

  _isLiked() {
    return !!this.props.liked_tags.get(this.props.tag);
  }

  render() {
    const {
      className = '',
      ...props
    } = this.props;
    let icon = 'favorite';
    let color = 'red';

    if (!this.props.is_logged_in) {
      return null;
    }

    if (!this._isLiked()) {
      icon = 'favorite_border';
      color = false;
    }

    const iconProps = omit(props, Object.keys(LikeTagButton.propTypes));

    return (
      <Icon
        {...iconProps}
        className={`action ${className}`}
        icon={icon}
        color={color}
        size={ICON_SIZE}
        onClick={this._toggleLike}
      />
    );
  }
}
