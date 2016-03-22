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
import _ from 'lodash';
import Comment from './comment';
import CreateComment from './create-comment';
import Icon from '../icon';

let Comments = (props) => {
  const {
    author,
    comments,
    triggers,
    post,
    users
  } = props;
  let postComments = [];

  console.info('comments', comments);
  console.info('users', users);

  if (post.post_comments.length) {
    postComments = (
      post.post_comments.map((commentID, i) => {
        const comment = comments[commentID];

        return (
          <Comment
            key={i}
            comment={comments[commentID]}
            author={users[comments[commentID].user_id]}
          />
        )
      })
    );
  }

  return (
    <div>
      <div className="card__comments comments">
        <header className="comments__header">
          <div className="comments__count">
            <Icon className="comments__count_icon" icon="chat_bubble_outline" />
            <div className="comments__count_title">{`${postComments.length} Comments`}</div>
          </div>
        </header>
        {postComments}
      </div>
      <CreateComment author={author} className="card__footer" postID={post.id} triggers={triggers} />
    </div>
  );

};

export default Comments;
