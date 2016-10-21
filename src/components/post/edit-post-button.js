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
import React from 'react';
import { Link } from 'react-router';

import Icon from '../icon';

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

const EditPostButton = ({ current_user, post }) => {
  if (current_user.get('id') !== post.get('user_id')) {
    return null;
  }

  const postEditUrl = getUrl(URL_NAMES.EDIT_POST, { uuid: post.get('id') });

  return (
    <div className="card__toolbar_item">
      <Link to={postEditUrl}>
        <Icon icon="edit" outline size="small" />
      </Link>
    </div>
  );
};

export default EditPostButton;
