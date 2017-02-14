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
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import Button from '../button';
import User from '../user';
import Textarea from '../textarea';
import Message from '../message';

const AddCommentPlaceholder = (props) => (
  <article className="comment comment--placeholder comment-transparent" {...props}>
    <div className="comment__container">
      <div className="comment__header" />
      <div className="comment__text action link">
        Add comment
      </div>
    </div>
  </article>
);

export default class CreateComment extends Component {
  static displayName = 'CreateComment';

  static propTypes = {
    className: PropTypes.string,
    ui: PropTypes.shape({}).isRequired
  };

  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      isExpanded: false,
      comment: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const commentUi = this.props.ui.getIn(['comments', 'new']);
    const nextCommentUi = nextProps.ui.getIn(['comments', 'new']);

    if (commentUi && nextCommentUi &&
        commentUi.get('isCreateInProgress') &&
        !nextCommentUi.get('isCreateInProgress') &&
        !nextCommentUi.get('error')) {
      this.setState({
        isExpanded: false,
        comment: ''
      });
    }
  }

  updateComment = (e) => {
    this.setState({
      isExpanded: true,
      comment: e.target.value
    });
  }

  expand = () => {
    if (!this.state.isExpanded) {
      this.setState({
        isExpanded: true
      });
    }
  };

  collapse = () => {
    this.setState({
      isExpanded: false
    });
  };

  postComment = (e) => {
    const {
      postId,
      triggers
    } = this.props;
    const comment = this.state.comment.trim();

    e && e.preventDefault();

    if (comment) {
      triggers.createComment(postId, comment);
    }
  };

  renderMessage = () => {
    const commentUi = this.props.ui.getIn(['comments', 'new']);

    if (commentUi.get('error')) {
      return (
        <div className="layout__row">
          <Message message={commentUi.get('error')} type="ERROR" />
        </div>
      );
    }

    return null;
  };

  render() {
    const { current_user, className } = this.props;
    const cn = classNames('comment', className);

    if (!current_user) {
      return (
        <div className={`${cn} content`}>
          You can not comment. Please <Link to="/auth">register or log in</Link>.
        </div>
      );
    }
    if (!this.state.isExpanded) {
      return <AddCommentPlaceholder onClick={this.expand} />;
    }

    const { comment } = this.state;
    const commentUi = this.props.ui.getIn(['comments', 'new']);

    return (
      <form className={`${cn} create_comment`} onSubmit={this.postComment}>
        <div className="comment__container">
          <div className="comment__header">
            <div className="comment__author">
              <User
                avatar={{ size: 24, isRound: false }}
                text={{ hide: true }}
                user={current_user.get('user')}
              />
            </div>
          </div>
          <div className="create_comment__body">
            <div className="layout__row">
              <Textarea
                autoFocus
                className="input input-block create_comment__input font--family_san-francisco"
                placeholder="Add comment"
                value={comment}
                onChange={this.updateComment}
              />
            </div>
            <div className="layout__row">
              <Button
                className="layout__grid_item"
                color="green"
                disabled={!comment.trim() || commentUi.get('isCreateInProgress')}
                size="midi"
                title="Add comment"
                type="submit"
              />
              <Button
                className="layout__grid_item"
                color="transparent"
                title="Cancel"
                onClick={this.collapse}
              />
            </div>
            {this.renderMessage()}
          </div>
        </div>
      </form>
    );
  }
}
