import React, { PropTypes } from 'react';
import ga from 'react-google-analytics';

import Icon from './icon';

/**
 * Universal component to use in the TagPage, SchoolPage, GeotagPage components.
 */
export default class LikeTagButton extends React.Component {
  static displayName = 'LikeTagButton';

  static propTypes = {
    hashtag: PropTypes.string,
    is_logged_in: PropTypes.bool.isRequired,
    // {tagName: tag}
    liked_tags: PropTypes.object,
    triggers: PropTypes.shape({
      likeTag: PropTypes.func.isRequired,
      unlikeTag: PropTypes.func.isRequired
    })
  };

  _toggleLike = () => {
    if (!this.props.is_logged_in) {
      alert('Please log in!');
      return;
    }

    if (this._isLiked()) {
      this.props.triggers.unlikeTag(this.props.tag);
    } else {
      this.props.triggers.likeTag(this.props.tag).then(() => {
        ga('send', 'event', 'Tags', 'Like', this.props.tag);
      });
    }
  };

  _isLiked() {
    return !!this.props.liked_tags[this.props.tag];
  }

  render() {
    const {
      className = ''
    } = this.props;
    let icon = 'favorite';
    let likedClassName = 'fa-heart color-red';

    if (!this.props.is_logged_in) {
      return null;
    }

    if (!this._isLiked()) {
      icon = 'favorite_border';
    }

    return (
      <Icon
        className={`action ${className}`}
        onClick={this._toggleLike}
        icon={icon}
      />
    );
  }
}
