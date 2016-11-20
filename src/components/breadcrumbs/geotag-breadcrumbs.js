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

import { Geotag as GeotagPropType } from '../../prop-types/geotags';

import Tag from '../tag';
import TagIcon from '../tag-icon';
import Breadcrumbs from './breadcrumbs';
import { TAG_LOCATION, TAG_PLANET } from '../../consts/tags';

const GeotagBreadcrumbs = ({ geotag }) => (
  <Breadcrumbs>
    <Link title="All Geotags" to="/geo">
      <TagIcon inactive type={TAG_PLANET} />
    </Link>
    {geotag.get('continent') &&
      <Tag
        inactive={geotag.get('type') != 'Continent'}
        name={geotag.getIn(['continent', 'name'])}
        type={TAG_LOCATION}
        urlId={geotag.getIn(['continent', 'url_name'])}
      />
    }
    {geotag.get('country') &&
      <Tag
        inactive={geotag.get('type') != 'Country'}
        name={geotag.getIn(['country', 'name'])}
        type={TAG_LOCATION}
        urlId={geotag.getIn(['country', 'url_name'])}
      />
    }
    {geotag.get('admin1') &&
      <Tag
        inactive={geotag.get('type') != 'AdminDivision1'}
        name={geotag.getIn(['admin1', 'name'])}
        type={TAG_LOCATION}
        urlId={geotag.getIn(['admin1', 'url_name'])}
      />
    }
    <Tag name={geotag.get('name')} type={TAG_LOCATION} urlId={geotag.get('url_name')} />
  </Breadcrumbs>
);

GeotagBreadcrumbs.displayName = 'GeotagBreadcrumbs';

GeotagBreadcrumbs.propTypes = {
  geotag: GeotagPropType.isRequired
};

export default GeotagBreadcrumbs;
