import React from 'react';
import ga from 'react-google-analytics';


// Statuses for the progress indication.
const STATUS_NOT_TOUCHED = 'STATUS_NOT_TOUCHED';
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
      status: STATUS_NOT_TOUCHED
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      this.setState({
        status: STATUS_NOT_TOUCHED
      });
    }
  }

  _followTag = (event) => {
    event.preventDefault();

    this.setState({
      status: STATUS_FOLLOWING
    });

    this.props.triggers.followTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_FOLLOWED
      });
      ga('send', 'event', 'Tags', 'Follow', this.props.tag);
    });
  };

  _unfollowTag = (event) => {
    event.preventDefault();

    this.setState({
      status: STATUS_UNFOLLOWING
    });

    this.props.triggers.unfollowTag(this.props.tag).then(() => {
      this.setState({
        status: STATUS_JUST_UNFOLLOWED
      });
    });
  };

  render() {
    const {
      className = '',
      current_user,
      followed_tags,
      ...props
    } = this.props;
    const status = this.state.status;

    if (!current_user) {
      return null;
    }

    // If followTag or unfollowTag was performed
    if (status !== STATUS_NOT_TOUCHED) {
      switch (status) {
        case STATUS_FOLLOWING:
          return <button {...props} className={`button button-green ${className}`} type="button">Following...</button>;
        case STATUS_UNFOLLOWING:
          return <button {...props} className={`button button-green ${className}`} type="button">Unfollowing...</button>;
        case STATUS_JUST_FOLLOWED:
          return <button {...props} className={`button button-yellow ${className}`} type="button" onClick={this._unfollowTag}>Followed!</button>;
        case STATUS_JUST_UNFOLLOWED:
          return <button {...props} className={`button button-green ${className}`} type="button" onClick={this._followTag}>Unfollowed!</button>;
        default:
          return null;
      }
    } else {
      const isFollowed = !!followed_tags[this.props.tag];

      if (isFollowed) {
        return <button {...props} className={`button button-yellow ${className}`} type="button" onClick={this._unfollowTag}>Following</button>;
      } else {  // eslint-disable-line no-else-return
        return <button {...props} className={`button button-red ${className}`} type="button" onClick={this._followTag}>Follow</button>;
      }
    }
  }
}
