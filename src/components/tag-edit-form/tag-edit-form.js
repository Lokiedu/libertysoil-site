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
import { pick } from 'lodash';

import GeotagEditForm from './geotag-edit-form';
import SchoolEditForm from './school-edit-form';
import HashtagEditForm from './hashtag-edit-form';
import { TAG_LOCATION, TAG_SCHOOL, TAG_HASHTAG } from '../../consts/tags';

export default class TagEditForm extends React.Component {
  static displayName = 'TagEditForm';

  static propTypes = {
    type: PropTypes.string.isRequired,
    tag: PropTypes.object.isRequired,
    saveHandler: PropTypes.func.isRequired,
    processing: PropTypes.bool.isRequired
  };

  render() {
    const {
      type,
      tag
    } = this.props;

    let commonProps = pick(this.props, ['saveHandler', 'processing']);

    switch (type) {
      case TAG_HASHTAG:
        return <HashtagEditForm hashtag={tag} {...commonProps} />;
      case TAG_SCHOOL:
        return <SchoolEditForm school={tag} {...commonProps} />;
      case TAG_LOCATION:
        return <GeotagEditForm geotag={tag} {...commonProps} />;
      default:
        return <script />;
    }
  }
}
