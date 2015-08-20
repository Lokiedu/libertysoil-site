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
          <section className="user_box">
            <a href="#" className="user_box__name">User Name</a>

            <div className="user_box__text">yesterday at 8:01</div>
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
