import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { truncate } from 'grapheme-utils';
import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_SCHOOL } from '../utils/tags';

export default class SidebarFollowedTag extends React.Component {
  static displayName = 'SidebarFollowedTag';

  static propTypes = {
    name: PropTypes.string,
    type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL]),
    urlId: PropTypes.string
  };

  render() {
    let { urlId, name, type } = this.props;
    let truncatedName = truncate(name, {length: 50});
    let className;
    let url;

    switch (type) {
      case TAG_HASHTAG: {
        className = 'sidebar__followed_tag-hashtag';
        url = `/tag/${urlId}`;
        break;
      }

      case TAG_SCHOOL: {
        className = 'sidebar__followed_tag-school';
        url = `/s/${urlId}`;
        break;
      }
    }

    return (
      <Link className={`sidebar__followed_tag ${className}`} title={name} to={url}>
        <TagIcon className="sidebar__followed_tag__icon" small type={type} />
        <span className="sidebar__followed_tag__name">{truncatedName}</span>
      </Link>
    );
  }
};
