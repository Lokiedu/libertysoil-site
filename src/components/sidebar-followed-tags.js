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
import React from 'react';
import { sortBy } from 'lodash';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';
import { ArrayOfSchools as ArrayOfSchoolsPropType } from '../prop-types/schools';
import { convertModelsToTags } from '../utils/tags';

import SidebarFollowedTag from './sidebar-followed-tag';

export default class SidebarFollowedTags extends React.Component {
  static displayName = 'SidebarFollowedTags';

  static propTypes = {
    // [geotags, hashtags, schools] are used by convertModelsToTags()
    geotags: ArrayOfGeotagsPropType,    // eslint-disable-line react/no-unused-prop-types
    hashtags: ArrayOfHashtagsPropType,  // eslint-disable-line react/no-unused-prop-types
    schools: ArrayOfSchoolsPropType     // eslint-disable-line react/no-unused-prop-types
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
