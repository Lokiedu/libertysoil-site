import React from 'react';

import User from './user';
import FollowButton from '../components/follow-button'

export default class ProfileHeader extends React.Component {
  render () {
    const { user, current_user, i_am_following } = this.props;
    let name = user.username;

    if (user.more) {
      if (user.more.firstName || user.more.lastName) {
        name = `${user.more.firstName} ${user.more.lastName}`;
      }
    }

    name = name.trim();

    return (
      <div className="profile">
        <div className="profile__body">
          <div className="layout__row">
            <User user={user} avatarSize="120" isRound={true} hideText={true} />
          </div>
          <div className="layout__row">
            <div className="layout__grid">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="profile__title">{name}</div>
              </div>
              <div className="layout__grid_item">
                42<br />
                Following
              </div>
              <div className="layout__grid_item">
                42<br />
                Followers
              </div>
              <div className="layout__grid_item">
                <FollowButton active_user={current_user} user={user} following={i_am_following}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
