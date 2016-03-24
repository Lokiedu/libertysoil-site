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

import Time from '../time';
import User from '../user';
import Icon from '../icon';
import Button from '../button';
import Textarea from '../textarea';

export default class Comment extends Component {
  state = {
    text: '',
    isEditMode: false
  };

  editComment = () => {
    const {
      comment
    } = this.props;

    this.setState({
      text: comment.text,
      isEditMode: true
    });
  }

  disableEditingComment = (e) => {
    e && e.preventDefault();

    this.setState({
      isEditMode: false
    });
  }

  saveComment = (e) => {
    const {
      postId,
      comment,
      triggers
    } = this.props;
    const {
      text
    } = this.state;
    let commentText = text.trim();

    e && e.preventDefault();

    if (commentText) {
      triggers.saveComment(postId, comment.id, commentText);
    }

    this.setState({
      isEditMode: false
    });
  }

  updateCommentText = (e) => {
    this.setState({
      text: e.target.value
    });
  }

  deleteComment = () => {
    const {
      postId,
      comment,
      triggers
    } = this.props;

    triggers.deleteComment(postId, comment.id);
  }

  renderToolbar = () => {
    const {
      author,
      current_user
    } = this.props;
    const {
      isEditMode
    } = this.state;
    let toolbar = null;

    if (current_user.id == author.id && !isEditMode) {
      toolbar = (
        <div className="comment__toolbar">
          <Icon
            onClick={this.editComment}
            className="comment__toolbar_item"
            icon="edit"
            size="small"
            title="Edit"
          />
          <Icon
            onClick={this.deleteComment}
            className="comment__toolbar_item"
            icon="delete"
            size="small"
            title="Delete"
          />
        </div>
      );
    }

    return toolbar;
  };

  renderBody = () => {
    const {
      comment
    } = this.props;
    const {
      text,
      isEditMode
    } = this.state;

    if (isEditMode) {
      return (
        <form
          className="comment__edit"
          onSubmit={this.saveComment}
        >
          <div className="layout__row">
            <Textarea
              className="input input-block comment__edit_area"
              value={text}
              onChange={this.updateCommentText}
            />
          </div>
          <div className="layout__row layout">
            <Button
              disabled={!text.trim()}
              type="submit"
              size="midi"
              className="layout__grid_item"
              title="Save Comment"
              color="light_blue"
            />
            <Button
              onClick={this.disableEditingComment}
              className="layout__grid_item"
              title="Cancel"
              color="transparent"
              size="midi"
            />
          </div>
        </form>
      );
    } else {
      return (
        <div className="comment__body">
          <section className="comment__text">
            {comment.text}
          </section>
          <footer className="comment__footer">
            <Time className="comment__time" timestamp={comment.updated_at} />
          </footer>
        </div>
      );
    }

    return toolbar;
  };

  render () {
    const {
      author
    } = this.props;

    return (
      <article className="comment">
        <header className="comment__header">
          <div className="comment__author">
            <User user={author} />
          </div>
          {this.renderToolbar()}
        </header>
        {this.renderBody()}
      </article>
    );
  }
}

export default Comment;
