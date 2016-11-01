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

import { ArrayOfPosts as ArrayOfPostsPropType } from '../prop-types/posts';

import { ShortPost } from './post';

const RelatedPosts = ({ posts, users }) => {
  if (!posts.size) {
    return null;
  }

  return (
    <div>
      <div className="sidebar_section_title">
        <h3>Related posts</h3>
      </div>
      {posts.map(post => {
        const author = users.get(post.get('user_id'));
        let text = 'No text...';

        if (post.get('text')) {
          text = truncate(post.get('text'), {
            length: 256
          });
        }

        return (
          <ShortPost
            author={author}
            key={post.get('id')}
            post={post.set('text', text)}
          />
        );
      })}
    </div>
  );
};

RelatedPosts.displayName = 'RelatedPosts';

RelatedPosts.propTypes = {
  posts: ArrayOfPostsPropType.isRequired
};

export default RelatedPosts;
