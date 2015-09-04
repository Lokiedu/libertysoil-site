import React from 'react'

export default class CurrentUserComponent extends React.Component {
  render() {
    return (
      <section className="layout__row user_box">
        <img className="user_box__avatar" src="http://api.randomuser.me/portraits/thumb/women/39.jpg" alt=""/>
        <div className="user_box__body">
          <p className="user_box__name">{this.props.current_user.username}</p>
          <p class="user_box__text">-</p>
        </div>
      </section>
    )
  }
}
