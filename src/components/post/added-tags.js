/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import TagCloud from '../tag-cloud';

export default class AddedTags extends React.Component {
  static displayName = 'AddedTags';

  static propTypes = {
    geotags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      url_name: PropTypes.string.isRequired
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired
    }))
  };

  render() {
    let { geotags, schools, tags } = this.props;

    if (!geotags.length && !schools.length && !tags.length) {
      return null;
    }

    return (
      <div className="post_added_tags">
        <h4 className="post_added_tags__heading">Post tags:</h4>
        <div className="post_added_tags__tags">
          <TagCloud {...this.props} />
        </div>
      </div>
    );
  }
}
