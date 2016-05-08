import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Link } from 'react-router';

import { truncate } from 'grapheme-utils';
import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_EVENT, TAG_PLANET, TAG_MENTION, SIZE } from '../consts/tags';


export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    deletable: PropTypes.bool,
    truncated: PropTypes.bool,
    inactive: PropTypes.bool,
    name: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.oneOf([
      TAG_HASHTAG,
      TAG_SCHOOL,
      TAG_LOCATION,
      TAG_EVENT,
      TAG_PLANET,
      TAG_MENTION
    ]),
    urlId: PropTypes.string
  };

  // 3 - mention

  static defaultProps = {
    truncated: false,
    deletable: false
  };

  _handleDelete = () => {
    let tag = _.pick(this.props, 'name', 'type', 'urlId');

    this.props.onDelete(tag);
  };

  _handleClick = () => {
    let tag = _.pick(this.props, 'name', 'type', 'urlId');

    this.props.onClick(tag);
  }

  render() {
    let { urlId, name, type, truncated, size, inactive, collapsed } = this.props;
    let tagName = name;
    let tagNameComponent;
    let tagIcon = <TagIcon className="tag__icon" type={type} />;
    let className;
    let title = name;
    let url;
    let tagBody;

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

      case TAG_EVENT: {
        className = 'tag-event';
        url = `/e/${urlId}`;
        break;
      }

      case TAG_PLANET: {
        className = 'tag-planet';
        url = `/planet`;
        break;
      }

      case TAG_MENTION: {
        className = 'tag-mention';
        url = `/@/${urlId}`;
        break;
      }
    }

    switch (size) {
      case SIZE.BIG: {
        className += ' tag-size_big';
        break;
      }
    }

    if (inactive) {
      className += ' tag-inactive';
    }

    if (truncated) {
      tagName = truncate(name, { length: 16 });
    }

    if (!collapsed && tagName) {
      tagNameComponent = <div key="name" className="tag__name">{tagName}</div>;
    }

    if (!title) {
      title = this.props.title;
    }

    tagBody = [
      <div key="icon" className="tag__icon_wrapper">
        {tagIcon}
      </div>,
      tagNameComponent
    ];

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
    } else if (this.props.onClick) {
      return (
        <div className={`tag tag-clickable ${className}`} title={name} onClick={this._handleClick}>
          <div className="tag__icon_wrapper">
            {tagIcon}
          </div>
          {tagNameComponent}
        </div>
      );
    } else {  // eslint-disable-line no-else-return
      // TODO: refactor to correct server rendering (location.pathname == url)
      //if (false) {
      //  return(
      //    <div className={`tag ${className}`} title={title}>
      //      {tagBody}
      //    </div>
      //  );
      //} else {
      return (
        <Link to={url} className={`tag ${className}`} title={title}>
          {tagBody}
        </Link>
      );
      //}
    }
  }
}
