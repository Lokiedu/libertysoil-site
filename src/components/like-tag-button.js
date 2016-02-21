import React, { PropTypes } from 'react';
import ga from 'react-google-analytics';


/**
 * Universal component to use in the TagPage, SchoolPage, GeotagPage components.
 */
export default class LikeTagButton extends React.Component {
  static displayName = 'LikeTagButton';

  static propTypes = {
    is_logged_in: PropTypes.bool.isRequired,
    // {tagName: tag}
    liked_tags: PropTypes.object,
    tag: PropTypes.string,
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
    if (!this.props.is_logged_in) {
      return null;
    }

    return (
      <span
        className={`action icon fa ${(this._isLiked()) ? 'fa-heart color-red' : 'fa-heart-o'}`}
        onClick={this._toggleLike}
      />
    );
  }
}
