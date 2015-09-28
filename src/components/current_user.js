import React from 'react'
import Gravatar from 'react-gravatar';

export default class CurrentUserComponent extends React.Component {
  render() {
    return (
      <section className="layout__row user_box">
        <Gravatar md5={this.props.current_user.gravatarHash} size={80} default="retro" className="user_box__avatar" />;
        <div className="user_box__body">
          <p className="user_box__name">{this.props.current_user.username}</p>
          <p className="user_box__text">-</p>
        </div>
      </section>
    )
  }
}
