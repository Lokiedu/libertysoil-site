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
import { Map as ImmutableMap } from 'immutable';

import { convertModelsToTags } from '../utils/tags';
import Tag from './tag';

// TODO: consider effeciency of using 'only' property
const TagCloud = ({ className, only, tags, ...props }) => {
  let requiredTags = tags;
  if (only.length > 0) {
    requiredTags = tags.filter((value, key) => only.includes(key));
  }

  const preparedTags = convertModelsToTags(requiredTags)
    .map((tag, index) => (
      <Tag
        key={tag.id || index}
        {...tag}
        {...props}
      />
    ));

  let cn = 'tags';
  if (className) {
    cn += ` ${className}`;
  }

  return (
    <div className={cn}>
      {preparedTags}
    </div>
  );
};

TagCloud.displayName = 'TagCloud';

TagCloud.propTypes = {
  only: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.shape({})
};

TagCloud.defaultProps = {
  only: [],
  tags: ImmutableMap({})
};

export default TagCloud;
