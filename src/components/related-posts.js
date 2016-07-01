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

import { truncate } from 'grapheme-utils';

import { ShortPost } from './post';

export default function RelatedPosts({ posts, users }) {
  if (!posts || !posts.length) {
    return null;
  }

  return (
    <div>
      <div className="sidebar_section_title">
        <h3>Related posts</h3>
      </div>
      {posts.map(post => {
        const author = users[post.user_id];
        let text = 'No text...';

        if (post.text) {
          text = truncate(post.text, {
            length: 256
          });
        }

        return (
          <ShortPost
            author={author}
            key={post.id}
            post={{
              ...post,
              text
            }}
          />
        );
      })}
    </div>
  );
}
