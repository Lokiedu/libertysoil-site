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

import { convertModelsToTags } from '../utils/tags';
import Tag from './tag';


const TagCloud = (props) => {
  const tags = convertModelsToTags(props)
    .map((tag, index) => (
      <Tag
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
  deletable: PropTypes.bool,
  geotags: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string
  })),
  hashtags: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string
  })),
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  schools: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url_name: PropTypes.string
  })),
  showPostCount: PropTypes.bool,
  truncated: PropTypes.bool
};

export default TagCloud;
