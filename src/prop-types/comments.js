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

import { date, uuid4, mapOf } from '../prop-types/common';

export const Comment = PropTypes.shape({
  created_at: date.isRequired,
  id: uuid4.isRequired,
  post_id: uuid4.isRequired,
  text: PropTypes.string.isRequired,
  updated_at: date.isRequired,
  user_id: uuid4.isRequired
});

export const CommentsByCategory = mapOf(uuid4, PropTypes.arrayOf(Comment));
