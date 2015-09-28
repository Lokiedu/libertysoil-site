import React, { Component } from 'react';
import Gravatar from 'react-gravatar';

import { URL_NAMES, getUrl } from '../utils/urlGenerator';

export default class User extends Component {
  render () {
    var { user, hideAvatar, avatarSize } = this.props;
    var render = {};

    if (!hideAvatar) {
      render.avatar = <Gravatar md5={user.gravatarHash} size={parseInt(avatarSize, 10)} default="retro" className="user_box__avatar" />;
    }

    if (user.more) {
      render.name = `${user.more.firstName || ''} ${user.more.lastName || ''}`;
    } else {
      render.name = user.username;
    }

    render.name = render.name.trim();

    return (
        <a href={getUrl(URL_NAMES.USER, { username: user.username })} className="user_box">
          {render.avatar}
          <div className="user_box__body">
            <p className="user_box__name">{render.name}</p>
            {false && <p className="user_box__text">-</p>}
          </div>
        </a>
    )
  }

  static propTypes = {
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired,
      avatar: React.PropTypes.string
    }).isRequired,
    gravatarHash: React.PropTypes.string,
    avatarSize: React.PropTypes.any.isRequired,
    hideAvatar: React.PropTypes.bool
  }

  static defaultProps = {
    hideAvatar: false,
    avatarSize: 26
  };
}
