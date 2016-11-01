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
import React from 'react';
import { Link } from 'react-router';

import Icon from '../icon';

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

export default class Toolbar extends React.Component {
  static displayName = 'post-toolbar';
  static propTypes = {
    current_user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      likes: React.PropTypes.arrayOf(React.PropTypes.string)
    }),
    post: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    }),
    triggers: React.PropTypes.shape({
      likePost: React.PropTypes.func.isRequired,
      unlikePost: React.PropTypes.func.isRequired
    })
  };

  likePost = (event) => {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.likePost(this.props.current_user.get('id'), this.props.post.get('id'));
  };

  unlikePost = (event) => {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unlikePost(this.props.current_user.get('id'), this.props.post.get('id'));
  };

  addPostToFavourites = (event) => {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.favPost(this.props.current_user.get('id'), this.props.post.get('id'));
  };

  removePostFromFavourites = (event) => {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unfavPost(this.props.current_user.get('id'), this.props.post.get('id'));
  };

  render() {
    const {
      current_user,
      post
    } = this.props;

    const postId = post.get('id');

    let likeIcon = 'favorite_border';
    let likeClass = '';
    let favIcon = 'star_border';
    let favClass = '';

    let like_action = this.likePost;
    let fav_action = this.addPostToFavourites;

    const isPostAuthor = (post.get('user_id') === current_user.get('id'));

    if (current_user.get('id')) {
      if (current_user.get('likes').includes(postId)) {
        // current user liked this post
        likeIcon = 'favorite';
        likeClass = 'color-red';
        like_action = this.unlikePost;
      }

      if (current_user.get('favourites').includes(postId)) {
        // current user faved this post
        favIcon = 'star';
        favClass = 'color-yellow';
        fav_action = this.removePostFromFavourites;
      }
    }

    if (isPostAuthor) {
      like_action = null;
      fav_action = null;
    }

    return (
      <div className="card__toolbar">
        <span className="card__toolbar_item action" onClick={like_action}>
          <Icon icon={likeIcon} className={likeClass} outline size="small" />
          {!!post.get('likers').size &&
            <span className="card__toolbar_item_value">{post.get('likers').size}</span>
          }
        </span>
        <span className="card__toolbar_item action" onClick={fav_action}>
          <Icon icon={favIcon} className={favClass} outline size="small" />
          {!!post.get('favourers').size &&
            <span className="card__toolbar_item_value">{post.get('favourers').size}</span>
          }
        </span>

        <Link className="card__toolbar_item action" to={getUrl(URL_NAMES.POST, { uuid: postId })} >
          <Icon icon="chat_bubble_outline" outline size="small" />
          <span className="card__toolbar_item_value">{post.get('comments')}</span>
        </Link>
      </div>
    );
  }
}
