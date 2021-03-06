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

import message from '../../utils/message';

import Comment from './comment';
import CreateComment from './create-comment';

const CommentsPlaceholder = ({ count, ...props }) => (
  <article className="comment comment--placeholder" {...props}>
    <div className="comment__container">
      <div className="comment__header" />
      <div className="comment__text action link">
        {message.compile('{count, plural, one{1 more comment} other{# more comments}}')({ count })}
      </div>
    </div>
  </article>
);

class Comments extends Component {
  static displayName = 'Comments';

  static defaultProps = {
    showAllComments: false
  };

  constructor(props) {
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

  renderComment = (comment, i) => {
    const {
      current_user,
      triggers,
      users,
      post,
      ui
    } = this.props;

    return (
      <Comment
        author={users.get(comment.get('user_id'))}
        comment={comment}
        current_user={current_user}
        key={i}
        postId={post.get('id')}
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

    const commentsData = comments.get(post.get('id'));
    const hasComments = post.get('comment_count') && commentsData && commentsData.size;
    let postComments = [];

    if (hasComments) {
      if (showAllComments) {
        postComments = commentsData.map(this.renderComment);
      } else {
        commentsData.take(2).map(this.renderComment).forEach(c => postComments.push(c));

        if (commentsData.size > 3) {
          postComments.push(
            <CommentsPlaceholder count={commentsData.size - 3} key="placeholder" onClick={this.showAllComments} />
          );
        }

        if (commentsData.size > 2) {
          postComments.push(this.renderComment(commentsData.last(), 'last'));
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
      current_user,
      triggers,
      post,
      ui
    } = this.props;

    return (
      <div>
        {this.renderComments()}
        <CreateComment
          current_user={current_user}
          postId={post.get('id')}
          triggers={triggers}
          ui={ui}
        />
      </div>
    );
  }
}

export default Comments;
