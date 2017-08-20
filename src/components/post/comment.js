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
import React, { Component } from 'react';
import i from 'immutable';

import Time from '../time';
import User from '../user';
import Button from '../button';
import Textarea from '../textarea';
import Message from '../message';
import Dropdown from '../dropdown';
import MenuItem from '../menu-item';
import paragraphify from '../../utils/paragraphify';

const CLOSED_DROPDOWN_ICON = {
  color: 'grey',
  icon: 'fiber-manual-record'
};

class Comment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      isEditMode: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      comment,
      ui
    } = this.props;

    const commentUi = ui.getIn(['comments', comment.get('id')]);
    const nextCommentUi = nextProps.ui.getIn(['comments', comment.get('id')]);

    if (commentUi && nextCommentUi && commentUi.get('isSaveInProgress') && !nextCommentUi.get('isSaveInProgress') && !nextCommentUi.get('error')) {
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
      text: comment.get('text'),
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

    const commentText = text.trim();

    e && e.preventDefault();

    if (commentText) {
      triggers.saveComment(postId, comment.get('id'), commentText);
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

    triggers.deleteComment(postId, comment.get('id'));
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

    const commentUi = ui.getIn(['comments', comment.get('id')]) || i.Map();
    const isButtonsDisabled = commentUi.get('isSaveInProgress') || commentUi.get('isDeleteInProgress');
    const isCurrentUserAuthor = current_user.get('id') == author.get('id');
    let toolbar = null;

    if (isCurrentUserAuthor && !isEditMode && !isButtonsDisabled) {
      // TODO: use 'brightness1' as Dropdown.props.iconClosed
      // look at .comment__dropdown definition
      toolbar = (
        <Dropdown className="comment__dropdown" iconClosed={CLOSED_DROPDOWN_ICON} theme="new">
          <MenuItem className="menu__item--theme_new" onClick={this.editComment}>
            Edit comment
          </MenuItem>
          <MenuItem className="menu__item--theme_new" onClick={this.deleteComment}>
            Delete
          </MenuItem>
        </Dropdown>
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
    const commentUi = ui.getIn(['comments', comment.get('id')]) || i.Map();
    const error = commentUi.get('error');

    if (error) {
      messageComponent = (
        <div className="layout__row">
          <Message message={error} type="ERROR" />
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

    const {
      text,
      isEditMode
    } = this.state;

    const commentUi = ui.getIn(['comments', comment.get('id')]) || i.Map();

    if (isEditMode) {
      return (
        <form
          className="comment__edit"
          onSubmit={this.saveComment}
        >
          <div className="layout__row">
            <Textarea
              className="input input-block"
              value={text}
              onChange={this.updateCommentText}
            />
          </div>
          <div className="layout__row layout">
            <Button
              className="layout__grid_item"
              color="green"
              disabled={!text.trim() || (commentUi.get('isSaveInProgress'))}
              size="midi"
              title="Save comment"
              type="submit"
            />
            <Button
              className="layout__grid_item"
              color="transparent"
              disabled={commentUi && commentUi.get('isSaveInProgress')}
              size="midi"
              title="Cancel"
              onClick={this.disableEditingComment}
            />
          </div>
        </form>
      );
    }

    return (
      <div className="comment__body">
        <section className="comment__text">
          {paragraphify(comment.get('text'))}
        </section>
        {false &&
          <footer className="comment__footer">
            <Time className="comment__time" timestamp={comment.get('updated_at')} />
          </footer>
        }
      </div>
    );
  };

  render() {
    const {
      author
    } = this.props;

    return (
      <article className="comment font--family_san-francisco">
        <div className="comment__container">
          <header className="comment__header">
            <div className="comment__author">
              <User avatar={{ size: 24, isRound: false }} text={{ hide: true }} user={author} />
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
