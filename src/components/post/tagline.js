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

import Tag from '../tag';
import { TAG_HASHTAG, TAG_SCHOOL, TAG_LOCATION } from '../../utils/tags';


export default class TagLine extends React.Component {
  static displayName = "TagLine"

  static propTypes = {
    geotags: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string
    })),
    tags: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string
    })),
    schools: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      url_name: React.PropTypes.string
    }))
  };

  render () {
    let {
      geotags,
      tags,
      schools
    } = this.props;

    if ((geotags && tags && schools) && (!geotags.length && !tags.length && !schools.length)) {
      return null;
    }

    let geotagBlocks = geotags.map(school => {
      return (
        <Tag key={school.id} name={school.name} type={TAG_LOCATION} urlId={school.url_name} />
      )
    });

    let schoolBlocks = schools.map(school => {
      return (
        <Tag key={school.id} name={school.name} type={TAG_SCHOOL} urlId={school.url_name} />
      )
    });

    let tagBlocks = tags.map(tag => {
      return (
        <Tag key={tag.id} name={tag.name} type={TAG_HASHTAG} urlId={tag.name} />
      )
    });

    return (
      <div className="tags">
        {geotagBlocks}
        {schoolBlocks}
        {tagBlocks}
      </div>
    );
  }
}
