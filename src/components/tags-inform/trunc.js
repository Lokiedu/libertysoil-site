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
import classNames from 'classnames';
import { assign, keys, transform } from 'lodash';

import { TagsToInform as TagsToInformPropType } from './prop-types';

import Navigation from '../navigation';
import NavigationItem from '../navigation-item';

const TagsInformTrunc = ({ tags, ...props }) => (
  <Navigation {...props}>
    {transform(tags, (acc, tagType, tagTypeTitle) => {
      if (keys(tagType.list).length) {
        const finalIcon = assign({}, tagType.icon, {
          className: classNames({
            'navigation-item__icon--remind': tagType.unreadPosts,
            [tagType.icon.className]: tagType.icon.className
          })
        });

        acc.push(
          <NavigationItem
            className="navigation-item--truncated"
            icon={finalIcon}
            key={tagTypeTitle}
            theme="2.0"
            to={tagType.url}
          />
        );
      }
    }, [])}
  </Navigation>
);

TagsInformTrunc.propTypes = {
  tags: TagsToInformPropType
};

export default TagsInformTrunc;
