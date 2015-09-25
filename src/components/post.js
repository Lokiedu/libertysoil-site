import React from 'react';
import request from 'superagent';
import Gravatar from 'react-gravatar';

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
    let name = this.props.author.username;
    if (
      this.props.author.more &&
      this.props.author.more.firstName &&
      this.props.author.more.lastName
    ) {
      name = `${this.props.author.more.firstName} ${this.props.author.more.lastName}`
    }

    return (
      <section className="card">
        <header className="card__header">&nbsp;</header>

        <div className="card__content">
          <p>{this.props.post.text}</p>
        </div>

        <div className="card__owner">
          <section className="layout__row user_box">
            <Gravatar email={this.props.author.email} size={32} default="retro" className="user_box__avatar" />
            <div className="user_box__body">
              <p className="user_box__name">{name}</p>
              <p className="user_box__text">-</p>
            </div>
          </section>
        </div>

        <footer className="card__footer">
          <TagLine tags={[]}/>

          <div className="card__toolbar">
            <span onClick={this.followUser.bind(this.props)}><span className="icon fa fa-heart-o"></span></span>
            <span className="icon fa fa-star-o"></span>
            <span className="disqus-comment-count" data-disqus-identifier={this.props.post.id}></span>
          </div>
        </footer>
      </section>
    )
  }
}
