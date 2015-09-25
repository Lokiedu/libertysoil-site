import React from 'react';
import request from 'superagent';

import {API_HOST} from '../config'
import {getStore, addError, updateFollowStatus} from '../store';

export class TextPostComponent extends React.Component {

  async followUser(event) {
    event.preventDefault();

    let author = this.author;

    //console.log(author.username);
    //console.log(this.current_user);

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
        <header className="card__header">
          Psychology today
        </header>
        <div className="card__content">
          <p>{this.props.post.text}</p>
        </div>
        <div className="card__owner">
          <section className="layout__row user_box">
            <img className="user_box__avatar" src="http://placehold.it/32x32" alt=""/>
            <div className="user_box__body">
              <p className="user_box__name">{name}</p>
              <p className="user_box__text">-</p>
            </div>
          </section>
        </div>
        <footer className="card__footer">
          <div className="tags">
            <span className="tag">Psychology</span>
            <span className="tag">Gaming</span>
          </div>
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
