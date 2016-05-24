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
    Component,
    PropTypes
} from 'react';
import { Link } from 'react-router';

import bem from '../../utils/bemClassNames';
import Button from '../button';
import User from '../user';
import Textarea from '../textarea';
import Message from '../message';

const AddCommentPlaceholder = (props) => (
  <article className="comment comment-transparent" {...props}>
    <div className="comment__container">
      <div className="comment__header"></div>
      <div className="comment__text action link">
        Add comment
      </div>
    </div>
  </article>
);

export default class CreateComment extends Component {
  static displayName = 'CreateComment';

  static propTypes = {
    author: PropTypes.object,
    className: PropTypes.string,
    ui: PropTypes.any.isRequired
  };

  static defaultProps = {
    className: ''
  };

  state = {
    isExpanded: false,
    comment: ''
  };

  componentWillReceiveProps (nextProps) {
    const {
      ui
    } = this.props;
    const commentUi = ui.comments.new;
    const nextCommentUi = nextProps.ui.comments.new;

    if (commentUi && nextCommentUi && commentUi.isCreateInProgress && !nextCommentUi.isCreateInProgress && !nextCommentUi.error) {
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
    const {
      ui
    } = this.props;
    let messageComponent = null;
    const commentUi = ui.comments.new || {};

    if (commentUi.error) {
      messageComponent = (
        <div className="layout__row">
          <Message message={commentUi.error} type="ERROR" />
        </div>
      );
    }

    return messageComponent;
  };

  render () {
    const {
      author,
      className,
      ui
    } = this.props;
    const {
      isExpanded,
      comment
    } = this.state;
    const blockClassName = bem.makeClassName({
      block: 'create_comment',
      modifiers: {
        expanded: isExpanded
      }
    });
    const commentUi = ui.comments.new || {};

    if (!author) {
      return (
        <div className={`${blockClassName} ${className} content`}>
          You can not comment. Please <Link to="/auth">register or log in</Link>.
        </div>
      );
    }

    if (!isExpanded) {
      return <AddCommentPlaceholder onClick={this.expand} />;
    }

    return (
      <form className={`${blockClassName} ${className}`} onSubmit={this.postComment}>
        <div className="layout">
          <div className="layout__grid_item">
            <User
              avatarSize="32"
              hideText
              user={author}
            />
          </div>
          <div className="layout__grid_item layout__grid_item-wide">
            <div className="layout__row">
              <Textarea
                autoFocus
                className="input input-block create_comment__input"
                placeholder="Add Comment"
                value={comment}
                onChange={this.updateComment}
              />
            </div>
            <div className="layout__row">
              <Button
                className="layout__grid_item"
                color="light_blue"
                disabled={!comment.trim() || commentUi.isCreateInProgress}
                size="midi"
                title="Post"
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
    )
  }
}
