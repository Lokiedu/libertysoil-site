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
import request from 'superagent';
import { Link } from 'react-router';
import ReactDisqusThread from '../scripts/disqus-thread';

import bem from '../utils/bemClassNames';
import User from './user';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

import {API_HOST} from '../config'
import {getStore, addError, setLikes} from '../store';

class TagLine extends React.Component {
  render() {
    if (this.props.tags.length == 0) {
      return <script/>
    }

    let tagBlocks = this.props.tags.map(name => <span className="tag">{name}</span>)

    return (
      <div className="tags">
        {tagBlocks}
      </div>
    )
  }
}

class Toolbar extends React.Component {
  async likePost(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    let post_id = this.props.post.id;

    try {
      let res = await request.post(`${API_HOST}/api/v1/post/${post_id}/like`);

      if (res.body.success) {
        getStore().dispatch(setLikes(this.props.current_user.id, res.body.likes));
      } else {
        getStore().dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  async unlikePost(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    let post_id = this.props.post.id;

    try {
      let res = await request.post(`${API_HOST}/api/v1/post/${post_id}/unlike`);

      if (res.body.success) {
        getStore().dispatch(setLikes(this.props.current_user.id, res.body.likes));
      } else {
        getStore().dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  addPostToFavourites(event) {

  }

  render()
  {
    let heart_class = 'fa-heart-o';
    let like_action = this.likePost.bind(this);

    if (this.props.current_user && this.props.current_user.likes.indexOf(this.props.post.id) > -1) {
      // current user liked this post
      heart_class = 'fa-heart color-red';
      like_action = this.unlikePost.bind(this);
    }

    return (
      <div className="card__toolbar">
        <span className="card__toolbar_item action" onClick={like_action}>
          <span className="icon fa fa-heart-o"></span>
          {false && <span className="card__toolbar_item_value">0</span>}
        </span>

        <span className="card__toolbar_item action" onClick={this.addPostToFavourites.bind(this.props)}>
          <span className="icon fa fa-star-o"></span>
          {false && <span className="card__toolbar_item_value">0</span>}
        </span>

        <span className="card__toolbar_item action">
          <span className="icon fa fa-comment-o"></span>
          <span className="card__toolbar_item_value disqus-comment-count" data-disqus-identifier={this.props.post.id}></span>
        </span>
      </div>
    )
  }
}

export class TextPostComponent extends React.Component {
  render() {
    var props = this.props;
    var post = props.post;
    var cardClassName = bem.makeClassName({
      block: 'card',
      modifiers: {
        full: props.fullPost
      }
    });

    let post_url = getUrl(URL_NAMES.POST, { uuid: post.id });

    let Comments;

    if (this.props.fullPost) {
      let post = this.props.post;

      Comments = (props) => (
        <div className="card__comments">
          <ReactDisqusThread
            shortname="lstest"
            identifier={props.post.id}
            title="Post"
            url={`http://alpha.libertysoil.org/post/${props.post.id}`}
            categoryId={props.post.type}/>
        </div>
      )
    } else {
      Comments = () => { return <script/> };
    }

    return (
      <section className={cardClassName}>
        <div className="card__content">
          <p>{post.text}</p>
        </div>

        <div className="card__owner">
          <User user={this.props.author} avatarSize="32" timestamp={post.created_at} timestampLink={post_url} />
        </div>

        <footer className="card__footer">
          <Link to={post_url} className="card__link"><span className="fa fa-link"></span></Link>
          <TagLine tags={[]}/>
          <Toolbar post={post} current_user={this.props.current_user} />
        </footer>

        <Comments post={post}/>
      </section>
    )
  }
}
