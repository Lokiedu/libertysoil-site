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
import { Link } from 'react-router';

import Tag from '../tag';
import TagIcon from '../tag-icon';
import Breadcrumbs from './breadcrumbs';
import { TAG_HASHTAG } from '../../consts/tags';

export default class HashtagBreadcrumbs extends React.Component {
  static displayName = 'HashtagBreadcrumbs';

  static propTypes = {
    hashtag: PropTypes.shape({
      name: PropTypes.string
    }).isRequired
  };

  render() {
    const {
      hashtag
    } = this.props;

    return (
      <Breadcrumbs>
        <Link to="/tag" title="All Hashtags">
          <TagIcon inactive type={TAG_HASHTAG} />
        </Link>
        <Tag name={hashtag.name} type={TAG_HASHTAG} urlId={hashtag.name} />
      </Breadcrumbs>
    );
  }
}
