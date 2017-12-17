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

import {
  MapOfPosts as MapOfPostsPropType,
  ArrayOfPostsId as ArrayOfPostsIdPropType
} from '../prop-types/posts';
import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';
import {
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import * as PostTypes  from '../consts/postTypeConstants';
import { ShortTextPost, PostWrapper } from './post';
import TagLikePost from './tag-like-post';

const RiverOfPostsComponent = (props) => {
  const {
    comments,
    current_user,
    posts,
    river,
    triggers,
    ui,
    users
  } = props;

  if (isUndefined(river)) {
    return null;
  }

  const postsWithData = river.map(id => posts.get(id));

  return (
    <div>
      {postsWithData.map((post) => {
        const author = users.get(post.get('user_id'));
        const postId = post.get('id');

        switch (post.get('type')) {
          case PostTypes.HASHTAG_LIKE:
          case PostTypes.SCHOOL_LIKE:
          case PostTypes.GEOTAG_LIKE:
            return (
              <TagLikePost
                author={author}
                key={postId}
                post={post}
              />
            );
          case PostTypes.SHORT_TEXT:
          case PostTypes.LONG_TEXT:
            return (
              <PostWrapper
                author={author}
                comments={comments.get(postId)}
                current_user={current_user}
                key={postId}
                post={post}
                triggers={triggers}
                ui={ui}
                users={users}
              >
                <ShortTextPost
                  mode="preview"
                  post={post}
                />
              </PostWrapper>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

RiverOfPostsComponent.displayName = 'RiverOfPostsComponent';

RiverOfPostsComponent.propTypes = {
  comments: CommentsByCategoryPropType.isRequired,
  current_user: CurrentUserPropType,
  posts: MapOfPostsPropType.isRequired,
  river: ArrayOfPostsIdPropType.isRequired,
  ui: PropTypes.shape({}).isRequired,
  users: MapOfUsersPropType.isRequired
};

export default RiverOfPostsComponent;
