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
import React, { PropTypes } from 'react';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_MENTION, TAG_LOCATION, TAG_EVENT } from '../utils/tags';

export default class TagIcon extends React.Component {
  static displayName = 'TagIcon';

  static propTypes = {
    className: PropTypes.string,
    small: PropTypes.bool,
    type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL]).isRequired
  };

  render() {
    let className = 'tag_icon';

    if (this.props.small) {
      className += ' tag_icon-small';
    }

    if (this.props.className) {
      className += ` ${this.props.className}`;
    }

    switch (this.props.type) {
      case TAG_HASHTAG:
        return (
          <span className={`${className} tag_icon-hashtag`}>#</span>
        );
      case TAG_SCHOOL:
        return (
          <span className={`${className} tag_icon-school micon`}>school</span>
        );
      case TAG_MENTION:
        return (
          <span className={`${className} tag_icon-mention`}>@</span>
        );
      case TAG_LOCATION:
        return (
          <span className={`${className} tag_icon-location micon`}>location</span>
        );
      case TAG_EVENT:
        return (
          <span className={`${className} tag_icon-event micon`}>calendar</span>
        );
    }
  }
}
