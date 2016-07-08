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
import { sortBy } from 'lodash';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';

import SidebarFollowedTag from './sidebar-followed-tag';
import { convertModelsToTags } from '../utils/tags';

export default class SidebarFollowedTags extends React.Component {
  static displayName = 'SidebarFollowedTags';

  static propTypes = {
    geotags: ArrayOfGeotagsPropType,
    hashtags: ArrayOfHashtagsPropType,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      url_name: PropTypes.string
    }))
  };

  _collectTags() {
    const tags = convertModelsToTags(this.props);

    return sortBy(tags, 'name');
  }

  _renderTags() {
    return this._collectTags().map(function (tag, index) {
      return <SidebarFollowedTag key={index} {...tag} />;
    });
  }

  render() {
    return (
      <div className="sidebar__followed_tags">
        {this._renderTags()}
      </div>
    );
  }
}
