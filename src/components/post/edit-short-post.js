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
import PropTypes from 'prop-types';

import React from 'react';
import { isUndefined } from 'lodash';

const EditPostShort = ({ post }) => {
  let value = '';

  if (!isUndefined(post)) {
    value = post.get('text');
  }

  return (
    <div className="layout__row">
      <textarea
        className="input input-textarea input-block"
        defaultValue={value}
        name="text"
        placeholder="Share education related resources, your perspective"
      />
    </div>
  );
};

EditPostShort.displayName = 'EditPostShort';

EditPostShort.propTypes = {
  post: PropTypes.shape({
    text: PropTypes.string
  })
};

export default EditPostShort;
