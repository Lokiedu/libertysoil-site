/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import React, { PropTypes } from 'react';
import { pick } from 'lodash';
import { Link } from 'react-router';

import { truncate } from 'grapheme-utils';
import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_EVENT, TAG_PLANET, TAG_MENTION, SIZE } from '../consts/tags';


export default class Tag extends React.Component {
  static displayName = 'Tag';

  static propTypes = {
    addable: PropTypes.bool,
    collapsed: PropTypes.bool,
    deletable: PropTypes.bool,
    inactive: PropTypes.bool,
    name: PropTypes.string,
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
    postCount: PropTypes.number,
    showPostCount: PropTypes.bool,
    size: PropTypes.string,
    truncated: PropTypes.bool,
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
    deletable: false,
    showPostCount: false
  };

  _handleDelete = () => {
    const tag = pick(this.props, 'name', 'type', 'urlId');

    this.props.onDelete(tag);
  };

  _handleClick = () => {
    const tag = pick(this.props, 'name', 'type', 'urlId');

    this.props.onClick(tag);
  }

  render() {
    const { urlId, name, type, truncated, size, inactive, collapsed } = this.props;

    let tagName = name;
    let tagNameComponent;
    const tagIcon = <TagIcon className="tag__icon" type={type} />;
    let className;
    let title = name;
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
      tagNameComponent = <div className="tag__name" key="name">{tagName}</div>;
    }

    if (!title) {
      title = this.props.title;
    }

    const tagBody = [
      <div className="tag__icon_wrapper" key="icon">
        {tagIcon}
      </div>,
      tagNameComponent
    ];

    if (this.props.showPostCount) {
      tagBody.push(<span className="tag__post_count" key="counter">{this.props.postCount || 0}</span>);
    }

    // FIXME: this should be reimplemented as 2 different components
    if (this.props.deletable) {
      return (
        <div className={`tag ${className}`} title={name}>
          <div className="tag__icon_wrapper">
            <span className="micon tag__icon tag__action clickable" onClick={this._handleDelete}>close</span>
            {tagIcon}
          </div>
          {tagNameComponent}
        </div>
      );
    } else if (this.props.onClick) {
      return (
        <div className={`tag tag-clickable ${className}`} title={name} onClick={this._handleClick}>
          <div className="tag__icon_wrapper">
            {this.props.addable &&
              <span className="micon tag__icon tag__action clickable">add</span>
            }
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
        <Link className={`tag ${className}`} title={title} to={url}>
          {tagBody}
        </Link>
      );
      //}
    }
  }
}
