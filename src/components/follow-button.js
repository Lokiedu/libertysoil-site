import React from 'react';
import _ from 'lodash';

export default class FollowButton extends React.Component {
  static displayName = 'FollowButton';
  static propTypes = {
    active_user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    }),
    following: React.PropTypes.arrayOf(React.PropTypes.string),
    triggers: React.PropTypes.shape({
      followUser: React.PropTypes.func.isRequired,
      unfollowUser: React.PropTypes.func.isRequired
    }),
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    })
  };

  followUser(event) {
    event.preventDefault();
    this.props.triggers.followUser(this.props.user)
  }

  unfollowUser(event) {
    event.preventDefault();
    this.props.triggers.unfollowUser(this.props.user)
  }

  render() {
    if (!this.props.active_user) {
      return <script/>;  // anonymous
    }

    const user = this.props.user;
    const active_user = this.props.active_user;

    if (user.id === active_user.id) {
      return <script/>;  // do not allow to follow one's self
    }

    let is_followed = (this.props.following.indexOf(user.id) != -1);

    if (is_followed) {
      return <button className="button button-wide button-yellow" onClick={this.unfollowUser.bind(this)}>Following</button>;
    } else {
      return <button className="button button-wide button-green" onClick={this.followUser.bind(this)}>Follow</button>;
    }
  }
}
