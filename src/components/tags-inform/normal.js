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
import { Map as ImmutableMap } from 'immutable';

import Navigation from '../navigation';
import NavigationItem from '../navigation-item';
import TagCloud from '../tag-cloud';

const TagsInformNormal = ({ tags, ...props }) => (
  <Navigation {...props}>
    {tags.reduce((acc, tagType, tagTypeTitle) => {
      if (tagType.get('list').size) {
        let unread = tagType.get('unreadPosts');
        if (unread > 99) {
          unread = '99+';
        }

        acc.push(
          <NavigationItem
            badge={unread}
            icon={tagType.get('icon')}
            key={tagTypeTitle}
            theme="2.0"
          >
            <TagCloud
              className="tags--row tags--queue"
              tags={ImmutableMap({ [tagTypeTitle]: tagType.get('list') })}
              theme="min"
              truncated
              smartCollapsing
            />
          </NavigationItem>
        );

        return acc;
      }

      return acc;
    }, [])}
  </Navigation>
);

export default TagsInformNormal;
