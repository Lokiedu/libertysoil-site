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

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';
import {
  ArrayOfSchools as ArrayOfSchoolsPropType,
  ArrayOfLightSchools as ArrayOfLightSchoolsPropType
} from '../prop-types/schools';

import { convertModelsToTags } from '../utils/tags';
import Tag from './tag';

const TagCloud = (props) => {
  const tags = convertModelsToTags(props)
    .map((tag, index) => (
      <Tag
        addable={props.addable}
        deletable={props.deletable}
        key={index}
        showPostCount={props.showPostCount}
        truncated={props.truncated}
        onClick={props.onClick}
        onDelete={props.onDelete}
        {...tag}
      />
    ));

  return (
    <div className="tags">
      {tags}
    </div>
  );
};

TagCloud.displayName = 'TagCloud';

TagCloud.propTypes = {
  addable: PropTypes.bool,
  deletable: PropTypes.bool,
  geotags: ArrayOfGeotagsPropType,
  hashtags: ArrayOfHashtagsPropType,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  schools: PropTypes.oneOfType([
    ArrayOfLightSchoolsPropType,
    ArrayOfSchoolsPropType
  ]),
  showPostCount: PropTypes.bool,
  truncated: PropTypes.bool
};

export default TagCloud;
