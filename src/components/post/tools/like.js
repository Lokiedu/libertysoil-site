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
import React, { PropTypes } from 'react';

import { OldIcon as Icon } from '../../icon';
import { ICON_SIZE } from './config';

export default class PostLike extends React.Component {
  static propTypes = {
    authorId: PropTypes.string.isRequired,
    current_user: PropTypes.shape({
      id: PropTypes.string,
      likes: PropTypes.arrayOf(PropTypes.string)
    }),
    postId: PropTypes.string.isRequired,
    triggers: PropTypes.shape({
      likePost: PropTypes.func.isRequired,
      unlikePost: PropTypes.func.isRequired
    })
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  likePost = () => {
    const userId = this.props.current_user.get('id');
    if (!userId) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.likePost(userId, this.props.postId);
  };

  unlikePost = () => {
    const userId = this.props.current_user.get('id');
    if (!userId) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unlikePost(userId, this.props.postId);
  };

  render() {
    const { authorId, current_user, postId } = this.props;

    let className = 'color-red card__action';
    let action = this.likePost;
    if (current_user.get('id')) {
      if (current_user.get('likes').includes(postId)) {
        className = 'card__action icon-outline--red color-white';
        action = this.unlikePost;
      }

      if (current_user.get('id') === authorId) {
        action = null;
      }
    }

    return (
      <span className="card__toolbar_item card__toolbar_item--right action" onClick={action}>
        <Icon icon="favorite" className={className} outline size={ICON_SIZE} />
      </span>
    );
  }
}
