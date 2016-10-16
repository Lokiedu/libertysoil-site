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

import {
  uuid4 as uuid4PropType,
  Immutable as ImmutablePropType
} from '../../prop-types/common';
import { ArrayOfSchools } from '../../prop-types/schools';
import { TAG_SCHOOL } from '../../consts/tags';
import TagIcon from '../tag-icon';


export default function SchoolList({ onClick, schools, selectedSchoolId }) {
  const items = schools.map((school, index) => {
    const handleClick = () => onClick(school.get('id'));
    let className = 'tools_item tools_item-clickable';
    if (school.get('id') === selectedSchoolId) {
      className += ' tools_item-selected';
    }

    return (
      <div
        className={className}
        key={index}
        onClick={handleClick}
      >
        <TagIcon type={TAG_SCHOOL} />
        <span className="tools_item__child-padded">{school.get('name')}</span>
        <span
          className="schools_tool__post_count"
          title="Number of times this school was used"
        >
          ({school.get('post_count')})
        </span>
      </div>
    );
  });

  return (
    <div>
      {items}
    </div>
  );
}

SchoolList.propTypes = {
  onClick: PropTypes.func.isRequired,
  schools: ImmutablePropType(ArrayOfSchools),
  selectedSchoolId: uuid4PropType
};
