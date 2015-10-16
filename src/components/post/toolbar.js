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
import React from 'react';
import { Link } from 'react-router';

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

  likePost(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.likePost(this.props.current_user.id, this.props.post.id);
  }

  unlikePost(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unlikePost(this.props.current_user.id, this.props.post.id);
  }

  addPostToFavourites(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.favPost(this.props.current_user.id, this.props.post.id);
  }

  removePostFromFavourites(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    this.props.triggers.unfavPost(this.props.current_user.id, this.props.post.id);
  }

  render()
  {
    let heart_class = 'fa-heart-o';
    let star_class = 'fa-star-o';
    let like_action = this.likePost.bind(this);
    let fav_action = this.addPostToFavourites.bind(this);

    if (this.props.current_user) {
      if (this.props.current_user.likes.indexOf(this.props.post.id) > -1) {
        // current user liked this post
        heart_class = 'fa-heart color-red';
        like_action = this.unlikePost.bind(this);
      }

      if (this.props.current_user.favourites.indexOf(this.props.post.id) > -1) {
        // current user faved this post
        star_class = 'fa-star color-yellow';
        fav_action = this.removePostFromFavourites.bind(this);
      }
    }

    return (
      <div className="card__toolbar">
        <span className="card__toolbar_item action" onClick={like_action}>
          <span className={`icon fa ${heart_class}`}></span>
          <span className="card__toolbar_item_value">{this.props.post.likers.length}</span>
        </span>

        <span className="card__toolbar_item action" onClick={fav_action}>
          <span className={`icon fa ${star_class}`}></span>
          <span className="card__toolbar_item_value">{this.props.post.favourers.length}</span>
        </span>

        <Link className="card__toolbar_item action" to={getUrl(URL_NAMES.POST, { uuid: this.props.post.id })} >
          <span className="icon fa fa-comment-o"></span>
          <span className="card__toolbar_item_value disqus-comment-count" data-disqus-identifier={this.props.post.id}></span>
        </Link>
      </div>
    )
  }
}
