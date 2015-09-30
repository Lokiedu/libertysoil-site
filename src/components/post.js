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
      heart_class = 'fa-heart';
      like_action = this.unlikePost.bind(this);
    }

    return (
      <div className="card__toolbar">
        <span className="card__toolbar_item action" onClick={like_action}>
          <span className={`icon fa ${heart_class}`}></span>
        </span>

        <span className="card__toolbar_item action" onClick={this.addPostToFavourites.bind(this.props)}>
          <span className="card__toolbar_item icon fa fa-star-o"></span>
        </span>

        <span className="card__toolbar_item disqus-comment-count" data-disqus-identifier={this.props.post.id}></span>
      </div>
    )
  }
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

    let Comments;

    if (this.props.fullPost) {
      let post = this.props.post;

      Comments = (props) => {
        return <div className="card__comments">
          <ReactDisqusThread
            shortname="lstest"
            identifier={props.post.id}
            title="Post"
            url={`http://alpha.libertysoil.org/post/${props.post.id}`}
            categoryId={props.post.type}/>
        </div>
      }
    } else {
      Comments = () => { return <script/> };
    }

    let post_url = getUrl(URL_NAMES.POST, { uuid: post.id });

    return (
      <section className={cardClassName}>
        <div className="card__content">
          <p>{post.text}</p>
        </div>

        <div className="card__owner">
          <User user={this.props.author} avatarSize="32" timestamp={post.created_at} timestampLink={post_url} />
        </div>

        <footer className="card__footer">
          <TagLine tags={[]}/>
          <Toolbar post={post} current_user={this.props.current_user} />
        </footer>

        <Comments post={post}/>
      </section>
    )
  }
}
