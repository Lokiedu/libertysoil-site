/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { omit } from 'lodash';
import { Map as ImmutableMap } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';

import createSelector from '../../selectors/createSelector';
import { compareTagsByDate } from '../../utils/tags';
import TagsInformNormal from './themes/normal';

const TAGS_ORDER = ['geotags', 'hashtags', 'schools'];

// TODO: remove in favor of propTypes when immutable types are OK
const USED_PROPS = [
  'followed_hashtags', 'followed_geotags', 'followed_schools',
  'geotags', 'hashtags', 'schools',
  'theme'
];

class FollowedTagsInform extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.tags = ImmutableMap(TAGS_ORDER.map(tagType => [
      tagType,
      ImmutableMap({
        entries: props[`followed_${tagType}`].get('entries').asMutable()
          .toList()
          .map(id => props[tagType].get(id))
          .sort(compareTagsByDate)
          .take(5).asImmutable(),
        post_count: props[`followed_${tagType}`].get('post_count')
      })
    ]));
    this.innerProps = omit(props, USED_PROPS);
  }

  componentWillReceiveProps(nextProps) {
    this.tags = this.tags.withMutations(tags => {
      for (const tagType of TAGS_ORDER) {
        const prevFollowed = this.props[`followed_${tagType}`];
        const nextFollowed = nextProps[`followed_${tagType}`];

        if (
          nextFollowed.get('entries') !== prevFollowed.get('entries') ||
          nextProps[tagType] !== this.props[tagType]
        ) {
          tags.setIn(
            [tagType, 'entries'],
            nextFollowed.get('entries').asMutable()
              .toList()
              .map(id => nextProps[tagType].get(id))
              .sort(compareTagsByDate)
              .take(5).asImmutable()
          );
        }

        if (nextFollowed.get('count_path') !== prevFollowed.get('count_path')) {
          tags.setIn([tagType, 'post_count'], nextFollowed.get('count_path'));
        }
      }
    });

    this.innerProps = omit(nextProps, USED_PROPS);
  }

  render() {
    return (
      <TagsInformNormal
        tags={this.tags}
        {...this.innerProps}
      />
    );
  }
}

const selectFollowedGeotags = createSelector(
  state => state.getIn(['current_user', 'followed_geotags']),
  followed_geotags => ImmutableMap({ entries: followed_geotags })
);


const selectFollowedHashtags = createSelector(
  state => state.getIn(['current_user', 'followed_hashtags']),
  followed_hashtags => ImmutableMap({ entries: followed_hashtags })
);

const selectFollowedSchools = createSelector(
  state => state.getIn(['current_user', 'followed_schools']),
  followed_schools => ImmutableMap({ entries: followed_schools })
);

const mapStateToProps = createSelector(
  selectFollowedGeotags,
  selectFollowedHashtags,
  selectFollowedSchools,
  state => state.get('geotags'),
  state => state.get('hashtags'),
  state => state.get('schools'),
  (
    followed_geotags, followed_hashtags, followed_schools,
    geotags, hashtags, schools
  ) => ({
    followed_geotags, followed_hashtags, followed_schools,
    geotags, hashtags, schools
  })
);

export default connect(mapStateToProps)(FollowedTagsInform);
