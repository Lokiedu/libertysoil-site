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
import Message from '../message';
import paragraphify from '../../utils/paragraphify';

export default class Comment extends Component {
  state = {
    text: '',
    isEditMode: false
  };

  componentWillReceiveProps (nextProps) {
    const {
      comment,
      ui
    } = this.props;
    const commentUi = ui.comments[comment.id];
    const nextCommentUi = nextProps.ui.comments[comment.id];

    if (commentUi && nextCommentUi && commentUi.isSaveInProgress && !nextCommentUi.isSaveInProgress && !nextCommentUi.error) {
      this.setState({
        isEditMode: false
      });
    }
  }

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
      current_user,
      comment,
      ui
    } = this.props;
    const {
      isEditMode
    } = this.state;
    const commentUi = ui.comments[comment.id] || {};
    const isButtonsDisabled = commentUi.isSaveInProgress || commentUi.isDeleteInProgress;
    let toolbar = null;

    if (current_user && author && current_user.id == author.id && !isEditMode) {
      toolbar = (
        <div className="comment__toolbar">
          <Icon
            onClick={this.editComment}
            className="comment__toolbar_item"
            icon="edit"
            size="small"
            title="Edit"
            disabled={isButtonsDisabled}
          />
          <Icon
            onClick={this.deleteComment}
            className="comment__toolbar_item"
            icon="delete"
            size="small"
            title="Delete"
            disabled={isButtonsDisabled}
          />
        </div>
      );
    }

    return toolbar;
  };

  renderMessage = () => {
    const {
      comment,
      ui
    } = this.props;
    let messageComponent = null;
    const commentUi = ui.comments[comment.id] || {};

    if (commentUi.error) {
      messageComponent = (
        <div className="layout__row">
          <Message message={commentUi.error} type="ERROR" />
        </div>
      );
    }

    return messageComponent;
  };

  renderBody = () => {
    const {
      comment,
      ui
    } = this.props;
    const commentUi = ui.comments[comment.id];
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
              disabled={!text.trim() || (commentUi && commentUi.isSaveInProgress)}
              type="submit"
              size="midi"
              className="layout__grid_item"
              title="Save Comment"
              color="light_blue"
            />
            <Button
              disabled={commentUi && commentUi.isSaveInProgress}
              onClick={this.disableEditingComment}
              className="layout__grid_item"
              title="Cancel"
              color="transparent"
              size="midi"
            />
          </div>
        </form>
      );
    }

    return (
      <div className="comment__body">
        <section className="comment__text">
          {paragraphify(comment.text)}
        </section>
        {false &&
          <footer className="comment__footer">
            <Time className="comment__time" timestamp={comment.updated_at} />
          </footer>
        }
      </div>
    );
  };

  render () {
    const {
      author
    } = this.props;

    return (
      <article className="comment">
        <div className="comment__container">
          <header className="comment__header">
            <div className="comment__author">
              <User user={author} avatarSize="17" hideText={true} />
            </div>
          </header>
          {this.renderBody()}
          {this.renderToolbar()}
        </div>
        {this.renderMessage()}
      </article>
    );
  }
}

export default Comment;
