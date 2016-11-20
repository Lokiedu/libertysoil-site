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
import { omit } from 'lodash';

import TagsInformNormal from './normal';

/**
 * Navigation-like block displaying number of unread posts
 * per each group of tags (geotags, schools, hashtags)
 */
export default class TagsInform extends React.Component {
  static propTypes = {
    theme: PropTypes.string
  };

  static defaultProps = {
    theme: 'normal'
  };

  /**
   * An example of result:
    {
      className: 'navigation-item--color_green',
      list: values(current_user.followed_geotags) || [],
      icon: { icon: 'place', className: 'navigation-item__icon--remind_green' },
      unreadPosts: 44,
      url: '/geo/'
    }
   */
  getUserPostTags = () => {
    const { current_user } = this.props;

    return {
      geotags: {
        className: 'navigation-item--color_green',
        list: current_user.get('followed_geotags').toList(),
        icon: { icon: 'place' },
        url: '/geo/'
      },
      hashtags: {
        className: 'navigation-item--color_blue',
        list: current_user.get('followed_hashtags').toList(),
        icon: { icon: 'hashtag' },
        url: '/tag/'
      },
      schools: {
        className: 'navigation-item--color_red',
        list: current_user.get('followed_schools').toList(),
        icon: { icon: 'school' },
        url: '/s/'
      }
    };
  }

  render() {
    const tags = this.getUserPostTags();
    const childrenProps = {
      tags,
      ...omit(this.props, ['current_user', 'theme'])
    };

    switch (this.props.theme) {
      case 'normal':
      default: return <TagsInformNormal {...childrenProps} />;
    }
  }
}