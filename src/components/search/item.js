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
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION, TAG_PLANET } from '../../consts/tags';

import ListItem from '../list-item';
import TagIcon from '../tag-icon';
import User from '../user';

const iconProps = (type) => ({
  size: { inner: 'ml', outer: 'm' },
  className: classNames('search__result-icon', 'tag_icon-wide', 'search__result-icon--type_'.concat(type)),
  round: false
});

export default class SearchItem extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { type, name, urlId, ...props } = this.props;

    let itemIcon, itemName, itemUrl;
    switch (type) {
      case TAG_LOCATION:
      case TAG_PLANET: {
        itemIcon = <TagIcon {...iconProps('geotag')} type={TAG_LOCATION} {...props} />;
        itemName = name;
        itemUrl = `/geo/${urlId}`;
        break;
      }
      case TAG_HASHTAG: {
        itemIcon = <TagIcon {...iconProps('hashtag')} type={TAG_HASHTAG} {...props} />;
        itemName = name;
        itemUrl = `/tag/${name}`;
        break;
      }
      case TAG_SCHOOL: {
        itemIcon = <TagIcon {...iconProps('school')} type={TAG_SCHOOL} {...props} />;
        itemName = name;
        itemUrl = `/s/${urlId}`;
        break;
      }
      case 'people': {
        const user = this.props.user;
        itemIcon = (
          <div className="card__owner">
            <User
              avatar={{ isRound: false, size: 32 }}
              isLink={false}
              text={{ hide: true }}
              user={user}
            />
          </div>
        );
        itemName = user.get('fullName');
        if (itemName === ' ') {
          itemName = user.get('username');
        }
        itemUrl = `/user/${user.get('username')}`;
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error('Unhandled search result type:', type);
        return null;
      }
    }

    return (
      <Link className="list_item list_item--no_space" to={itemUrl}>
        <ListItem className="list_item--no_space" icon={itemIcon}>
          {itemName}
        </ListItem>
      </Link>
    );
  }
}
