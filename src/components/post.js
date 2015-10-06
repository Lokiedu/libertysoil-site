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
import ReactDisqusThread from '../scripts/disqus-thread';
import Linkify from 'react-linkify';

import bem from '../utils/bemClassNames';
import User from './user';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

import { API_HOST } from '../config'
import ApiClient from '../api/client'
import { getStore, addError, setLikes } from '../store';

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
      let client = new ApiClient(API_HOST);
      let responseBody = await client.like(post_id);

      if (responseBody.success) {
        getStore().dispatch(setLikes(this.props.current_user.id, responseBody.likes));
      } else {
        getStore().dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  }

  async unlikePost(event) {
    event.preventDefault();

    if (!this.props.current_user) {
      alert('Please log in!');
      return;
    }

    let post_id = this.props.post.id;

    try {
      let client = new ApiClient(API_HOST);
      let responseBody = await client.unlike(post_id);

      if (responseBody.success) {
        getStore().dispatch(setLikes(this.props.current_user.id, responseBody.likes));
      } else {
        getStore().dispatch(addError('internal server error. please try later'));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  }

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
          <span className={`icon fa ${heart_class}`}></span>
          {false && <span className="card__toolbar_item_value">0</span>}
        </span>

        <span className="card__toolbar_item action" onClick={this.addPostToFavourites.bind(this.props)}>
          <span className="icon fa fa-star-o"></span>
          {false && <span className="card__toolbar_item_value">0</span>}
        </span>

        <Link className="card__toolbar_item action" to={getUrl(URL_NAMES.POST, { uuid: this.props.post.id })} >
          <span className="icon fa fa-comment-o"></span>
          <span className="card__toolbar_item_value disqus-comment-count" data-disqus-identifier={this.props.post.id}></span>
        </Link>
      </div>
    )
  }
}

let EditPostButton = (props) => {
  if (!props.current_user || props.current_user.id !== props.post.user_id) {
    return <script/>;
  }

  let post_edit_url = getUrl(URL_NAMES.EDIT_POST, { uuid: props.post.id });

  return (
    <div className="card__toolbar_item">
      <Link to={post_edit_url}><span className="fa fa-pencil-square-o"></span></Link>
    </div>
  );
};

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
    let post_edit_url = getUrl(URL_NAMES.EDIT_POST, { uuid: post.id });

    let Comments;

    if (this.props.fullPost) {
      Comments = (props) => (
        <div className="card__comments">
          <ReactDisqusThread
            categoryId={props.post.type}
            identifier={props.post.id}
            shortname="lstest"
            title="Post"
            url={`http://alpha.libertysoil.org/post/${props.post.id}`}
          />
        </div>
      )
    } else {
      Comments = () => { return <script/> };
    }

    return (
      <section className={cardClassName}>
        <div className="card__content">
          <Linkify properties={{target: '_blank'}}>
            <p>{post.text}</p>
          </Linkify>
        </div>

        <div className="card__owner">
          <User avatarSize="32" timestamp={post.created_at} timestampLink={post_url} user={this.props.author}/>
        </div>

        <footer className="card__footer">
          <TagLine tags={[]}/>
          <div className="card__toolbars">
            <Toolbar post={post} current_user={this.props.current_user} />
            <div className="card__toolbar card__toolbar-right">
              <EditPostButton current_user={this.props.current_user} post={post} />
              <div className="card__toolbar_item"><Link to={post_url}><span className="fa fa-link"></span></Link></div>
            </div>
          </div>
        </footer>

        <Comments post={post}/>
      </section>
    )
  }
}
