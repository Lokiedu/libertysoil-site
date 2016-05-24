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
import { truncate } from 'grapheme-utils';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION } from '../consts/tags';
import TagIcon from './tag-icon';

const SidebarFollowedTag = ({ urlId, name, type }) => {
  const truncatedName = truncate(name, { length: 50 });
  let className;
  let url;

  switch (type) {
    case TAG_LOCATION: {
      className = 'sidebar__followed_tag-location';
      url = `/geo/${urlId}`;
      break;
    }
    case TAG_HASHTAG: {
      className = 'followed_tag-hashtag';
      url = `/tag/${urlId}`;
      break;
    }

    case TAG_SCHOOL: {
      className = 'followed_tag-school';
      url = `/s/${urlId}`;
      break;
    }
  }

  return (
    <Link
      activeClassName="followed_tag-active"
      className={`followed_tag ${className}`}
      title={name}
      to={url}
    >
      <TagIcon className="followed_tag__icon" small type={type} />
      <span className="followed_tag__name">{truncatedName}</span>
    </Link>
  );
};

SidebarFollowedTag.displayName = 'SidebarFollowedTag';

SidebarFollowedTag.propTypes = {
  name: PropTypes.string,
  type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION]),
  urlId: PropTypes.string
};

export default SidebarFollowedTag;
