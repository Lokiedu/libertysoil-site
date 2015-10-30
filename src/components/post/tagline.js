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
import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';

export default class TagLine extends React.Component {
  static displayName = "TagLine"

  static propTypes = {
    tags: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string
    })),
    schools: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      url_name: React.PropTypes.string,
    }))
  };

  render () {
    let {
        tags,
        schools
      } = this.props;

    if (tags.length == 0 || !schools) {
      return <script/>;
    }

    let tagBlocks = tags.map(tag => {
      let school = _.find(schools, {name: tag.name});
      let class_name = 'tag';
      let link_to = `/tag/${tag.name}`;

      if (school) {
        class_name = 'tag school';
        link_to = `/s/${school.url_name}`;
      }

      return (
        <Link to={link_to} className={class_name} key={`tag-${tag.id}`}>
          {tag.name}
        </Link>
      )
    });

    return (
      <div className="tags">
        {tagBlocks}
      </div>
    );
  }
}
