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

import ShortTextPost from './short-text-post';
import User from '../user';

const ShortPost = ({ post, author }) => (
  <div className="short_post short_post-spacing" key={post.id}>
    <div className="short_post__text">
      <ShortTextPost author={author} post={post} />
    </div>
    <div className="short_post__author">
      <User avatarSize="20" user={author} />
    </div>
  </div>
);

export default ShortPost;
