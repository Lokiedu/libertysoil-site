import React from 'react'

export default class CurrentUserComponent extends React.Component {
  render() {
    return (
      <section className="layout__row user_box">
        <img className="user_box__avatar" src={this.props.currentUser.userPic} alt=""/>
        <div className="user_box__body">
          <p className="user_box__name">{this.props.currentUser.username}</p>
        </div>
      </section>
    )
  }
}
