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
import { Link } from 'react-router';

import { Hashtag as HashtagPropType } from '../../prop-types/hashtags';

import Tag from '../tag';
import TagIcon from '../tag-icon';
import Breadcrumbs from './breadcrumbs';
import { TAG_HASHTAG } from '../../consts/tags';

const HashtagBreadcrumbs = ({ hashtag }) => (
  <Breadcrumbs>
    <Link title="All Hashtags" to="/tag">
      <TagIcon inactive type={TAG_HASHTAG} />
    </Link>
    <Tag name={hashtag.get('name')} type={TAG_HASHTAG} urlId={hashtag.get('name')} />
  </Breadcrumbs>
);

HashtagBreadcrumbs.displayName = 'HashtagBreadcrumbs';

HashtagBreadcrumbs.propTypes = {
  hashtag: HashtagPropType.isRequired
};

export default HashtagBreadcrumbs;
