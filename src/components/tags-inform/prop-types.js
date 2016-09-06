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
import { PropTypes } from 'react';

import { MapOfGeotags as MapOfGeotagsPropType } from '../../prop-types/geotags';
import { MapOfHashtags as MapOfHashtagsPropType } from '../../prop-types/hashtags';
import { MapOfSchools as MapOfSchoolsPropType } from '../../prop-types/schools';

const IconPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    className: PropTypes.string,
    icon: PropTypes.string
    // take more from IconComponent
  })
]);

const getTagTypeToInform = (validate) => (
  PropTypes.shape({
    icon: IconPropType,
    list: validate,
    unreadPosts: PropTypes.number,
    url: PropTypes.string
  })
);

export const TagsToInform = PropTypes.shape({
  geotags: getTagTypeToInform(MapOfGeotagsPropType),
  hashtags: getTagTypeToInform(MapOfHashtagsPropType),
  schools: getTagTypeToInform(MapOfSchoolsPropType)
});
