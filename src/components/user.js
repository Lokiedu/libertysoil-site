import React, { Component } from 'react';
import Gravatar from 'react-gravatar';

export default class User extends Component {
  render () {
    var { user, hideAvatar, avatarSize } = this.props;
    var render = {};

    if (!hideAvatar) {
      render.avatar = <Gravatar md5={user.gravatarHash} size={avatarSize} default="retro" className="user_box__avatar" />;
    }

    return (
        <div className="user_box">
          {render.avatar}
          <div className="user_box__body">
            <p className="user_box__name">{user.username}</p>
            {false && <p className="user_box__text">-</p>}
          </div>
        </div>
    )
  }

  static propTypes = {
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired,
      avatar: React.PropTypes.string
    }).isRequired,
    avatarSize: React.PropTypes.number,
    hideAvatar: React.PropTypes.bool
  }

  static defaultProps = {
    hideAvatar: false,
    avatarSize: 26
  };
}
