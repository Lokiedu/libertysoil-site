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

import Navigation from '../navigation';
import NavigationItem from '../navigation-item';
import TagCloud from '../tag-cloud';
import Icon from '../icon';

/*
  TODO: links to users' pages related to tags (NavigationItem)
 */

/**
 * Navigation-like block displaying number of unread posts
 * per each group of tags (geotags, schools, hashtags)
 *
 * @type  ReactComponent
 * @param Object tags
 */
const TagsInformer = ({ tags }) => {
  const { geotags, hashtags, schools } = tags;

  return (
    <Navigation>
      {geotags && geotags.list &&
        <NavigationItem enabled to="/geo/">
          <div className="navigation-item__content">
            <TagCloud geotags={geotags.list} theme="min" />
          </div>
          <div className="navigation-item__aside">
            {geotags.unreadPosts}
          </div>
          <div className="navigation-item__icon">
            <Icon icon={geotags.icon} />
          </div>
        </NavigationItem>
      }
      {schools && schools.list  &&
        <NavigationItem enabled to="/schools/">
          <div className="navigation-item__content">
            <TagCloud schools={schools.list} theme="min" />
          </div>
          <div className="navigation-item__aside">
            {schools.unreadPosts}
          </div>
          <div className="navigation-item__icon">
            <Icon icon={schools.icon} />
          </div>
        </NavigationItem>
      }
      {hashtags && hashtags.list &&
        <NavigationItem enabled to="/tags/">
          <div className="navigation-item__content">
            <TagCloud hashtags={hashtags.list} theme="min" />
          </div>
          <div className="navigation-item__aside">
            {hashtags.unreadPosts}
          </div>
          <div className="navigation-item__icon">
            <Icon icon={hashtags.icon} />
          </div>
        </NavigationItem>
      }
    </Navigation>
  );
};

TagsInformer.propTypes = {
  tags: PropTypes.shape({
    geotags: PropTypes.shape({
      icon: PropTypes.string,
      list: PropTypes.shape({}),
      unreadPosts: PropTypes.number,
      url: PropTypes.string
    }),
    hashtags: PropTypes.shape({
      icon: PropTypes.string,
      list: PropTypes.shape({}),
      unreadPosts: PropTypes.number,
      url: PropTypes.string
    }),
    schools: PropTypes.shape({
      icon: PropTypes.string,
      list: PropTypes.shape({}),
      unreadPosts: PropTypes.number,
      url: PropTypes.string
    })
  })
};

export default TagsInformer;
