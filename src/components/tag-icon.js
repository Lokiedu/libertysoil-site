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
import classNames from 'classnames';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_MENTION, TAG_LOCATION, TAG_EVENT, TAG_PLANET } from '../consts/tags';

const TagIcon = ({ big, className, inactive, round, small, type, ...props }) => {
  const cn = classNames('tag_icon', className, {
    'tag_icon-small': small,
    'tag_icon-big': big,
    'tag_icon-inactive': inactive,
    'tag_icon-round': round
  });

  const spanProps = { ...props };
  delete spanProps.collapsed;

  switch (type) {
    case TAG_HASHTAG:
      return (
        <span className={`${cn} tag_icon-hashtag`} {...spanProps}>#</span>
      );
    case TAG_SCHOOL:
      return (
        <span className={`${cn} tag_icon-school`} {...spanProps}>
          <span className="micon">school</span>
        </span>
      );
    case TAG_MENTION:
      return (
        <span className={`${cn} tag_icon-mention`} {...spanProps}>@</span>
      );
    case TAG_LOCATION:
      return (
        <span className={`${cn} tag_icon-location`} {...spanProps}>
          <span className="micon">location_on</span>
        </span>
      );
    case TAG_EVENT:
      return (
        <span className={`${cn} tag_icon-event`} {...spanProps}>
          <span className="micon">event</span>
        </span>
      );
    case TAG_PLANET:
      return (
        <span className={`${cn} tag_icon-planet`} {...spanProps}>
          <span className="micon">public</span>
        </span>
      );
    default:
      return false;
  }
};

TagIcon.displayName = 'TagIcon';

TagIcon.propTypes = {
  big: PropTypes.bool,
  className: PropTypes.string,
  inactive: PropTypes.bool,
  round: PropTypes.bool,
  small: PropTypes.bool,
  type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL, TAG_MENTION, TAG_LOCATION, TAG_EVENT, TAG_PLANET]).isRequired
};

TagIcon.defaultProps = {
  round: true
};

export default TagIcon;
