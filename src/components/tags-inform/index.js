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
import { omit, values } from 'lodash';

import { CurrentUser as CurrentUserPropType } from '../../prop-types/users';

import TagsInformTrunc from './trunc';
import TagsInformNormal from './normal';
import TagsInformExtended from './extended';

/**
 * Navigation-like block displaying number of unread posts
 * per each group of tags (geotags, schools, hashtags)
 */
export default class TagsInform extends React.Component {
  static propTypes = {
    current_user: CurrentUserPropType,
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
        list: values(current_user.followed_geotags) || [],
        icon: { icon: 'place' },
        url: '/geo/'
      },
      hashtags: {
        className: 'navigation-item--color_blue',
        list: values(current_user.followed_hashtags) || [],
        icon: { icon: 'hashtag' },
        url: '/tag/'
      },
      schools: {
        className: 'navigation-item--color_red',
        list: values(current_user.followed_schools) || [],
        icon: { icon: 'school' },
        url: '/s/'
      }
    };
  }

  render() {
    const { theme } = this.props;
    const tags = this.getUserPostTags();

    const childrenProps = {
      tags,
      ...omit(this.props, ['current_user', 'theme'])
    };

    switch (theme) {
      case 'trunc': return <TagsInformTrunc {...childrenProps} />;
      case 'ext': return <TagsInformExtended {...childrenProps} />;
      case 'normal':
      default: return <TagsInformNormal {...childrenProps} />;
    }
  }
}
