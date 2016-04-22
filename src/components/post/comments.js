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

import React, {
  Component
} from 'react';

import Comment from './comment';
import CreateComment from './create-comment';
import message from '../../utils/message';

const CommentsPlaceholder = ({ count, ...props }) => (
  <article className="comment comment-placeholder" {...props}>
    <div className="comment__container">
      <div className="comment__header"></div>
      <div className="comment__text action link">
        {message.compile('{count, plural, one{1 comment} other{# comments}}')({ count })}
      </div>
    </div>
  </article>
);

class Comments extends Component {
  static displayName = 'Comments';

  defaultProps = {
    showAllComments: false
  };

  constructor (props) {
    super(props);

    this.state = {
      showAllComments: props.showAllComments
    };
  }

  showAllComments = () => {
    this.setState({
      showAllComments: true
    });
  };

  renderComment = (i, comment) => {
    const {
      author,
      triggers,
      users,
      post,
      ui
    } = this.props;

    return (
      <Comment
        author={users[comment.user_id]}
        comment={comment}
        current_user={author}
        key={i}
        postId={post.id}
        triggers={triggers}
        ui={ui}
      />
    );
  };

  renderComments = () => {
    const {
      comments,
      post
    } = this.props;
    const {
      showAllComments
    } = this.state;
    const hasComments = !!(post.comments && comments && comments[post.id] && comments[post.id].length);
    let commentsData = [];
    let postComments = [];

    if (hasComments) {
      commentsData = comments[post.id];

      if (showAllComments) {
        postComments = commentsData.map((comment, i) => (this.renderComment(i, comment)));
      } else {
        postComments.push(this.renderComment(0, commentsData[0]));

        commentsData[1] && postComments.push(this.renderComment(1, commentsData[1]));

        if (commentsData.length > 3) {
          postComments.push(
            <CommentsPlaceholder onClick={this.showAllComments} key="placeholder" count={commentsData.length - 3} />
          );
        }

        if (commentsData.length > 2) {
          postComments.push(this.renderComment('last', commentsData[commentsData.length - 1]));
        }
      }

      return (
        <div className="card__comments comments">
          <section className="comments__body">
            {postComments}
          </section>
        </div>
      );
    }

    return false;
  };

  render() {
    const {
      author,
      triggers,
      post,
      ui
    } = this.props;

    return (
      <div>
        {this.renderComments()}
        <CreateComment
          author={author}
          className="card__footer"
          postId={post.id}
          triggers={triggers}
          ui={ui}
        />
      </div>
    );
  }
}

export default Comments;
