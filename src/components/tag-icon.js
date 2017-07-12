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
import React, { PropTypes } from 'react';
import classNames from 'classnames';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_MENTION, TAG_LOCATION, TAG_EVENT, TAG_PLANET } from '../consts/tags';

import { OldIcon as Icon } from './icon';

const TagIcon = ({ className, inactive, type, ...props }) => {
  const cn = classNames('tag_icon', className, {
    'tag_icon--inactive': inactive
  });

  switch (type) {
    case TAG_HASHTAG:
      return (
        <Icon
          className={`${cn} tag_icon--type_hashtag`}
          icon="hashtag"
          pack="fa"
          {...props}
        />
      );
    case TAG_SCHOOL:
      return (
        <Icon
          className={`${cn} tag_icon--type_school`}
          pack="fa"
          icon="graduation-cap"
          {...props}
        />
      );
    case TAG_MENTION:
      return (
        <Icon
          className={`${cn} tag_icon--type_mention`}
          icon="at"
          pack="fa"
          {...props}
        />
      );
    case TAG_LOCATION:
      return (
        <Icon
          className={`${cn} tag_icon--type_location`}
          pack="md"
          icon="location-on"
          {...props}
        />
      );
    case TAG_EVENT:
      return (
        <Icon
          className={`${cn} tag_icon--type_event`}
          icon="event"
          pack="md"
          {...props}
        />
      );
    case TAG_PLANET:
      return (
        <Icon
          className={`${cn} tag_icon--type_planet`}
          icon="public"
          pack="md"
          {...props}
        />
      );
    default:
      return false;
  }
};

TagIcon.displayName = 'TagIcon';

TagIcon.propTypes = {
  className: PropTypes.string,
  inactive: PropTypes.bool,
  type: PropTypes.oneOf([
    TAG_HASHTAG,
    TAG_SCHOOL,
    TAG_MENTION,
    TAG_LOCATION,
    TAG_EVENT,
    TAG_PLANET
  ]).isRequired
};

TagIcon.defaultProps = {
  round: true,
  size: 'small'
};

export default TagIcon;
