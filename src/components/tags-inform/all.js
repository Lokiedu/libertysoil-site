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
import TagsInformNormal from './themes/normal';

const TAGS_ORDER = ['geotags', 'hashtags', 'schools'];

// TODO: remove in favor of propTypes when immutable types are OK
const USED_PROPS = [
  'geotags', 'hashtags', 'schools',
  'recent_tags', 'theme'
];

class AllTagsInform extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.tags = ImmutableMap(TAGS_ORDER.map(tagType => [
      tagType,
      ImmutableMap({
        entries: props.recent_tags.getIn([tagType, 'entries']).asMutable()
          .take(5)
          .map(id => props[tagType].get(id))
          .asImmutable(),
        post_count: props.recent_tags.getIn([tagType, 'post_count'])
      })
    ]));
    this.innerProps = omit(props, USED_PROPS);
  }

  componentWillReceiveProps(nextProps) {
    this.tags = this.tags.withMutations(tags => {
      const nextRecent = nextProps.recent_tags;
      const prevRecent = this.props.recent_tags;

      for (const tagType of TAGS_ORDER) {
        const entriesPath = [tagType, 'entries'];

        if (
          nextRecent.getIn(entriesPath) !== prevRecent.getIn(entriesPath) ||
          nextProps[tagType] !== this.props[tagType]
        ) {
          tags.setIn(
            entriesPath,
            nextRecent.getIn(entriesPath).asMutable()
              .take(5)
              .map(id => nextProps[tagType].get(id))
              .asImmutable()
          );
        }

        const countPath = [tagType, 'post_count'];

        if (nextRecent.getIn(countPath) !== prevRecent.getIn(countPath)) {
          tags.setIn(countPath, nextRecent.getIn(countPath));
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

const mapStateToProps = createSelector(
  state => state.get('recent_tags'),
  state => state.get('geotags'),
  state => state.get('hashtags'),
  state => state.get('schools'),
  (recent_tags, geotags, hashtags, schools) => ({
    recent_tags, geotags, hashtags, schools
  })
);

export default connect(mapStateToProps)(AllTagsInform);
