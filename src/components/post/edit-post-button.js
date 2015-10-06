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

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

let EditPostButton = (props) => {
  if (!props.current_user || props.current_user.id !== props.post.user_id) {
    return <script/>;
  }

  let post_edit_url = getUrl(URL_NAMES.EDIT_POST, { uuid: props.post.id });

  return (
    <div className="card__toolbar_item">
      <Link to={post_edit_url}><span className="fa fa-pencil-square-o"></span></Link>
    </div>
  );
};

export default EditPostButton;
