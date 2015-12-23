import React from 'react';
import _ from 'lodash';

// Statuses for the progress indication.
const STATUS_FOLLOWING = 'STATUS_FOLLOWING';
const STATUS_JUST_FOLLOWED = 'STATUS_JUST_FOLLOWED';
const STATUS_UNFOLLOWING = 'STATUS_UNFOLLOWING';
const STATUS_JUST_UNFOLLOWED = 'STATUS_JUST_UNFOLLOWED';

/**
 * Universal component to use in the TagPage, SchoolPage components.
 */
export default class FollowTagButton extends React.Component {
  static displayName = 'FollowButton';
  static propTypes = {
    current_user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    }),
    // {tagName: tag}
    followed_tags: React.PropTypes.object,
    tag: React.PropTypes.string,
    triggers: React.PropTypes.shape({
      followTag: React.PropTypes.func.isRequired,
      unfollowTag: React.PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      status: null
    }
  }

  followTag(event) {
    event.preventDefault();

    this.setState({
      status: STATUS_FOLLOWING
    });

    this.props.triggers.followTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_FOLLOWED
      });
    });
  }

  unfollowTag(event) {
    event.preventDefault();

    this.setState({
      status: STATUS_UNFOLLOWING
    });

    this.props.triggers.unfollowTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_UNFOLLOWED
      });
    });
  }

  render() {
    let { current_user, followed_tags } = this.props;
    let status = this.state.status;

    if (!current_user) {
      return null;
    }

    // If followTag or unfollowTag was performed
    if (status) {
      switch (status) {
        case STATUS_FOLLOWING:
          return <button className="button button-green">Following...</button>;
        case STATUS_UNFOLLOWING:
          return <button className="button button-green">Unfollowing...</button>;
        case STATUS_JUST_FOLLOWED:
          return <button className="button button-yellow" onClick={this.unfollowTag.bind(this)}>Followed!</button>;
        case STATUS_JUST_UNFOLLOWED:
          return <button className="button button-green" onClick={this.followTag.bind(this)}>Unfollowed!</button>;
        default:
          return null;
      }
    } else {
      let isFollowed = !!followed_tags[this.props.tag];

      if (isFollowed) {
        return <button className="button button-yellow" onClick={this.unfollowTag.bind(this)}>Following</button>;
      } else {
        return <button className="button button-green" onClick={this.followTag.bind(this)}>Follow</button>;
      }
    }
  }
}
