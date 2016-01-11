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
    name: PropTypes.string,
    type: PropTypes.oneOf([TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION]),
    urlId: PropTypes.string
  };

  _handleDelete = () => {
    let tag = _.pick(this.props, 'name', 'type', 'urlId');

    this.props.onDelete(tag);
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

      case TAG_LOCATION: {
        className = 'tag-location';
        url = ``; // FIXME
        break;
      }
    }

    return (
      <div className="tag_wrapper">
        <Link className={`tag ${className}`} title={name} to={url}>
          <TagIcon className="tag__icon" type={type} />
          <span className="tag__name">{truncatedName}</span>
        </Link>
        {this.props.deletable &&
          <span className="micon tag__delete" onClick={this._handleDelete}>close</span>
        }
      </div>
    );
  }
}
