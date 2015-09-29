import React from 'react';
import request from 'superagent';
import { Link } from 'react-router';
import bem from '../utils/bemClassNames';

import User from './user';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

import {API_HOST} from '../config'
import {getStore, addError, updateFollowStatus} from '../store';

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

export class TextPostComponent extends React.Component {

  async followUser(event) {
    event.preventDefault();

    let author = this.author;

    try {
      let result = await request.post(`${API_HOST}/api/v1/follow`).type('form').send({username: author.username});

      getStore().dispatch(updateFollowStatus(result.body.status));
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  render() {
    var props = this.props;
    var post = props.post;
    var cardClassName = bem.makeClassName({
      block: 'card',
      modifiers: {
        full: props.fullPost
      }
    });

    return (
      <section className={cardClassName}>
        {false && <header className="card__header"></header>}
        <div className="card__content">
          <p>{post.text}</p>
          {!this.props.fullPost && <p className="card__read_link"><Link to={getUrl(URL_NAMES.POST, { uuid: post.id })}>Read full post</Link></p>}
        </div>
        <div className="card__owner">
          <User user={this.props.author} avatarSize="32" />
        </div>
        <footer className="card__footer">
          <TagLine tags={[]}/>
          <div className="card__toolbar">
            <span className="card__toolbar_item action" onClick={this.followUser.bind(this.props)}><span className="icon fa fa-heart-o"></span></span>
            <span className="card__toolbar_item icon fa fa-star-o"></span>
            <span className="card__toolbar_item disqus-comment-count" data-disqus-identifier={post.id}></span>
          </div>
        </footer>
        {!this.props.fullPost && <div className="card__comments">
          <ReactDisqusThread
              shortname="lstest"
              identifier={post.id}
              title="Post"
              url={`http://alpha.libertysoil.org/post/${post.id}`}
              categoryId={post.type}/>
        </div>}
      </section>
    )
  }
}
