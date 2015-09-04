import React from 'react'

export class TextPostComponent extends React.Component {
  render() {
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
              <p className="user_box__name">User Name</p>
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
            <span className="icon fa fa-heart-o"></span>
            <span className="icon fa fa-star-o"></span>
          </div>
        </footer>
      </section>
    )
  }
}
