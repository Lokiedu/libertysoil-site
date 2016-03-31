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

export default class CreateComment extends Component {
  static displayName = 'CreateComment';

  static propTypes = {
    className:  PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  state = {
    isExpanded: false,
    comment: ''
  };

  updateComment = (e) => {
    this.setState({
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
      postID,
      triggers
    } = this.props;
    const comment = this.state.comment.trim();

    e && e.preventDefault();

    if (comment) {
      triggers.createComment(postID, comment);
      this.setState({
        comment: ''
      });
    }
  };

  render () {
    const {
      className,
      author
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

    if (!author) {
      return (
        <div className={`${blockClassName} ${className} content`}>
          You can not comment. Please <Link to="/auth">register or log in</Link>.
        </div>
      );
    }

    return (
      <form onSubmit={this.postComment} className={`${blockClassName} ${className}`}>
        <div className="layout">
          {isExpanded &&
            <div className="layout__grid_item">
              <User avatarSize="32" user={author} hideText={true} />
            </div>
          }
          <div className="layout__grid_item layout__grid_item-wide">
            <div className="layout__row">
              <Textarea
                onFocus={this.expand}
                onChange={this.updateComment}
                className="input input-block create_comment__input"
                placeholder="Add Comment"
                value={comment}
              />
            </div>
            {isExpanded &&
              <div className="layout__row">
                <Button
                  disabled={!comment.trim()}
                  type="submit"
                  className="layout__grid_item"
                  title="Add Comment"
                  color="light_blue"
                />
                <Button onClick={this.collapse} className="layout__grid_item" title="Cancel" color="transparent" />
              </div>
            }
          </div>
        </div>
      </form>
    )
  }
}
