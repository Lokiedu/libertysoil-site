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

export default class PostFav extends React.Component {
  static propTypes = {
    authorId: PropTypes.string.isRequired,
    current_user: PropTypes.shape({
      id: PropTypes.string,
      favourites: PropTypes.arrayOf(PropTypes.string)
    }),
    postId: PropTypes.string.isRequired,
    triggers: PropTypes.shape({
      favPost: PropTypes.func.isRequired,
      unfavPost: PropTypes.func.isRequired
    })
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  favPost = () => {
    const userId = this.props.current_user.get('id');
    if (!userId) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.favPost(userId, this.props.postId);
  };

  unfavPost = () => {
    const userId = this.props.current_user.get('id');
    if (!userId) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unfavPost(userId, this.props.postId);
  };

  render() {
    const { authorId, current_user, postId } = this.props;

    let className = 'color-dark_green card__action';
    let action = this.favPost;
    if (current_user.get('id')) {
      if (current_user.get('favourites').includes(postId)) {
        className = 'card__action icon-outline--dark_green color-white';
        action = this.unfavPost;
      }

      if (current_user.get('id') === authorId) {
        action = null;
      }
    }

    return (
      <span className="card__toolbar_item action" onClick={action}>
        <Icon icon="star" className={className} outline size={ICON_SIZE} />
      </span>
    );
  }
}
