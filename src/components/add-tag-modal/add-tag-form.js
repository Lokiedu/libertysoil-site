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

import AddGeotagForm from './add-geotag-form';
import AddHashtagForm from './add-hashtag-form';
import AddSchoolForm from './add-school-form';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS } from '../../consts/tags';

const AddTagForm = ({
  addedTags: { geotags, schools, hashtags },
  allSchools,
  onAddGeotag, onAddHashtag, onAddSchool,
  type,
  userRecentTags,
  triggers
}) => {
  switch (type) {
    case TAG_LOCATION:
      return <AddGeotagForm addedGeotags={geotags} onAddGeotag={onAddGeotag} triggers={triggers} userRecentGeotags={userRecentTags.geotags} />;
    case TAG_HASHTAG:
      return <AddHashtagForm addedHashtags={hashtags} onAddHashtag={onAddHashtag} userRecentHashtags={userRecentTags.hashtags} />;
    case TAG_SCHOOL:
      return <AddSchoolForm addedSchools={schools} allSchools={allSchools} onAddSchool={onAddSchool} triggers={triggers} userRecentSchools={userRecentTags.schools} />;
    default:
      return false;
  }
};

AddTagForm.displayName = 'AddTagForm';

AddTagForm.propTypes = {
  addedTags: PropTypes.shape({
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    hashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  }),
  allSchools: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string
  })),
  onAddGeotag: PropTypes.func.isRequired,
  onAddHashtag: PropTypes.func.isRequired,
  onAddSchool: PropTypes.func.isRequired,
  triggers: PropTypes.shape({
    checkSchoolExists: PropTypes.func.isRequired,
    checkGeotagExists: PropTypes.func.isRequired
  }),
  type: PropTypes.oneOf(IMPLEMENTED_TAGS).isRequired,
  userRecentTags: PropTypes.shape({
    geotags: PropTypes.array.isRequired,
    schools: PropTypes.array.isRequired,
    hashtags: PropTypes.array.isRequired
  }).isRequired
};

export default AddTagForm;
