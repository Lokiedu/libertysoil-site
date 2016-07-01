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

import GeotagBreadcrumbs from './geotag-breadcrumbs';
import SchoolBreadcrumbs from './school-breadcrumbs';
import HashtagBreadcrumbs from './hashtag-breadcrumbs';
import { TAG_LOCATION, TAG_SCHOOL, TAG_HASHTAG } from '../../consts/tags';

const TagBreadcrumbs = ({ tag, type }) => {
  switch (type) {
    case TAG_HASHTAG:
      return <HashtagBreadcrumbs hashtag={tag} />;
    case TAG_SCHOOL:
      return <SchoolBreadcrumbs school={tag} />;
    case TAG_LOCATION:
      return <GeotagBreadcrumbs geotag={tag} />;
    default:
      return null;
  }
};

TagBreadcrumbs.displayName = 'TagBreadcrumbs';

TagBreadcrumbs.propTypes = {
  tag: PropTypes.shape({}).isRequired,
  type: PropTypes.string.isRequired
};

export default TagBreadcrumbs;
