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
import { Map as ImmutableMap } from 'immutable';
import { omit } from 'lodash';
import React from 'react';

import Navigation from '../../navigation';
import NavigationItem from '../../navigation-item';
import TagCloud from '../../tag-cloud';

// TODO: remove in favor of propTypes when immutable types are OK
const USED_PROPS = ['animated', 'tags', 'truncated'];

const CONFIG = {
  geotags: {
    className: 'navigation-item--color_green',
    icon: { icon: 'place' },
    url: '/feed/geo'
  },
  hashtags: {
    className: 'navigation-item--color_blue',
    icon: { icon: 'hashtag' },
    url: '/feed/tag'
  },
  schools: {
    className: 'navigation-item--color_red',
    icon: { icon: 'school' },
    url: '/feed/s'
  }
};

const TAGS_ORDER = ['geotags', 'hashtags', 'schools'];
function updateTags(tags, props) {
  return tags.withMutations(ts => {
    for (const tagType of TAGS_ORDER) {
      ts.setIn([tagType, tagType], props.tags.getIn([tagType, 'entries']));
    }
  });
}

export default class TagsInformNormal extends React.PureComponent {
  constructor(props, context) {
    super(props, context);

    this.innerProps = omit(props, USED_PROPS);
    this.tags = updateTags(ImmutableMap(), props);
  }

  componentWillReceiveProps(nextProps) {
    this.innerProps = omit(nextProps, USED_PROPS);
    this.tags = updateTags(this.tags, nextProps);
  }

  render() {
    const { animated, truncated } = this.props;

    return (
      <Navigation {...this.innerProps}>
        {this.props.tags.entrySeq().map(keyValuePair => {
          if (!keyValuePair[1].get('entries').size) {
            return false;
          }

          const postCount = keyValuePair[1].get('post_count');

          let counterValue;
          if (postCount) {
            counterValue = postCount.toString();
            if (counterValue.length > 2) {
              counterValue = '99+';
            }
          } else {
            counterValue = '';
          }

          return (
            <NavigationItem
              animated={animated}
              badge={counterValue}
              icon={CONFIG[keyValuePair[0]].icon}
              key={keyValuePair[0]}
              theme="2.0"
              to={CONFIG[keyValuePair[0]].url}
              truncated={truncated}
            >
              <TagCloud
                className="tags--row tags--queue"
                tags={this.tags.get(keyValuePair[0])}
                theme="min"
                truncated
                smartCollapsing
              />
            </NavigationItem>
          );
        })}
      </Navigation>
    );
  }
}
