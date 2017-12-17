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
import PropTypes from 'prop-types';
import React from 'react';

import { Comment as CommentPropType } from '../../prop-types/comments';

import PostFooter from './footer';
import Brief from './brief';
import Preview from './preview';
import Comments from './comments';

const PostWrapper = ({
  users,
  comments,
  post,
  author,
  triggers,
  showAllComments,
  children,
  current_user,
  ui
}) => {
  return (
    <section className="card">
      <div className="card__container">
        <Preview post={post} />
        <div className="card__content">
          {children}
        </div>
        <PostFooter
          current_user={current_user}
          post={post}
          triggers={triggers}
        />
      </div>

      <Brief
        author={author}
        current_user={current_user}
        post={post}
        triggers={triggers}
      />
      <Comments
        showAllComments={showAllComments}
        comments={comments}
        post={post}
        current_user={current_user}
        triggers={triggers}
        users={users}
        ui={ui}
      />
    </section>
  );
};

PostWrapper.propTypes = {
  comments: PropTypes.arrayOf(CommentPropType).isRequired
};

export default PostWrapper;
