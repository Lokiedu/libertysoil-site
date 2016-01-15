import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Link } from 'react-router';

import { truncate } from 'grapheme-utils';
import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION } from '../utils/tags';


export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    deletable: PropTypes.bool,
    truncated: PropTypes.bool,
    name: PropTypes.string,
    type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION]),
    urlId: PropTypes.string
  };

  static defaultProps = {
    truncated: false,
    deletable: false
  };

  _handleDelete = () => {
    let tag = _.pick(this.props, 'name', 'type', 'urlId');

    this.props.onDelete(tag);
  };

  render() {
    let { urlId, name, type, truncated } = this.props;
    let tagName = name;
    let tagNameComponent;
    let tagIcon = <TagIcon className="tag__icon" type={type} />;
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

      case TAG_LOCATION: {
        className = 'tag-location';
        url = `/geo/${urlId}`;
        break;
      }
    }

    if (truncated) {
      tagName = truncate(name, {length: 16});
    }

    tagNameComponent = <div className="tag__name">{tagName}</div>;

    // FIXME: this should be reimplemented as 2 different components
    if (this.props.deletable) {
      return (
        <div className={`tag ${className}`} title={name}>
          <div className="tag__icon_wrapper">
            <span className="micon tag__icon tag__delete clickable" onClick={this._handleDelete}>close</span>
            {tagIcon}
          </div>
          {tagNameComponent}
        </div>
      );
    } else {  // eslint-disable-line no-else-return
      return (
        <Link className={`tag ${className}`} title={name} to={url}>
          <div className="tag__icon_wrapper">
            {tagIcon}
          </div>
          {tagNameComponent}
        </Link>
      );
    }
  }
}
