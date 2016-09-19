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

import { TAG_TYPES } from '../../../consts/tags';

import Tag from '../tag';

const TAG_TYPES_TITLES = Object.keys(TAG_TYPES);

const TagAsLink = ({ ...props }) => {
  const { name, type, urlId } = props;
  const { url: typeUrl, isUrlFinal } = TAG_TYPES[type];

  let finalUrl = typeUrl;
  if (!isUrlFinal) {
    finalUrl += urlId;
  }

  return (
    <Link title={name} to={finalUrl}>
      <Tag {...props} />
    </Link>
  );
};

TagAsLink.propTypes = {
  name: PropTypes.string,
  type: PropTypes.oneOf(TAG_TYPES_TITLES),
  urlId: PropTypes.string
};

export default TagAsLink;
