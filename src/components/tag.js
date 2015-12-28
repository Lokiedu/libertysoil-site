import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { truncate } from 'grapheme-utils';
import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_SCHOOL } from '../utils/tags';

export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL]),
    urlId: PropTypes.string
  };

  render() {
    let { urlId, name, type } = this.props;
    let truncatedName = truncate(name, {length: 16});
    let className;
    let url;

    switch (type) {
      case TAG_HASHTAG: {
        className = 'tag-hashtag';
        url = `/tag/${urlId}`;
        break;
      }

      case TAG_SCHOOL: {
        className = 'tag-school';
        url = `/s/${urlId}`;
        break;
      }
    }

    return (
      <div className="tag_wrapper">
        <Link className={`tag ${className}`} title={name} to={url}>
          <TagIcon className="tag__icon" type={type} />
          <span className="tag__name">{truncatedName}</span>
        </Link>
      </div>
    );
  }
}
