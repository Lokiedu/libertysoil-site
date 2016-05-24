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

import { TAG_LOCATION, TAG_SCHOOL, TAG_HASHTAG } from '../../consts/tags';
import GeotagEditForm from './geotag-edit-form';
import SchoolEditForm from './school-edit-form';
import HashtagEditForm from './hashtag-edit-form';

const TagEditForm = (props) => {
  const { countries, tag, type } = props;

  switch (type) {
    case TAG_HASHTAG:
      return <HashtagEditForm hashtag={tag} {...props} />;
    case TAG_SCHOOL:
      return <SchoolEditForm countries={countries} school={tag} {...props} />;
    case TAG_LOCATION:
      return <GeotagEditForm geotag={tag} {...props} />;
    default:
      return <script />;
  }
};

TagEditForm.displayName = 'TagEditForm';

TagEditForm.propTypes = {
  countries: PropTypes.shape({}),
  processing: PropTypes.bool.isRequired,
  saveHandler: PropTypes.func.isRequired,
  tag: PropTypes.shape({}).isRequired,
  type: PropTypes.string.isRequired
};

export default TagEditForm;
