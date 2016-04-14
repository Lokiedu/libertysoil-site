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
import { isEmpty } from 'lodash';
import { Link } from 'react-router';

import Tag from '../tag';
import TagIcon from '../tag-icon';
import Breadcrumbs from './breadcrumbs';
import { TAG_LOCATION, TAG_PLANET } from '../../consts/tags';

export default class GeotagBreadcrumbs extends React.Component {
  static displayName = 'GeotagBreadcrumbs';

  static propTypes = {
    geotag: PropTypes.shape({
      name: PropTypes.string,
      url_name: PropTypes.string
    }).isRequired
  };

  render() {
    const {
      geotag
    } = this.props;

    return (
      <Breadcrumbs>
        <Link title="All Geotags" to="/geo">
          <TagIcon inactive type={TAG_PLANET} />
        </Link>
        {!isEmpty(geotag.continent) &&
          <Tag
            inactive={geotag.type != 'Continent'}
            name={geotag.continent.name}
            type={TAG_LOCATION}
            urlId={geotag.continent.url_name}
          />
        }
        {!isEmpty(geotag.country) &&
          <Tag
            inactive={geotag.type != 'Country'}
            name={geotag.country.name}
            type={TAG_LOCATION}
            urlId={geotag.country.url_name}
          />
        }
        {!isEmpty(geotag.admin1) &&
          <Tag
            inactive={geotag.type != 'AdminDivision1'}
            name={geotag.admin1.name}
            type={TAG_LOCATION}
            urlId={geotag.admin1.url_name}
          />
        }
        <Tag name={geotag.name} type={TAG_LOCATION} urlId={geotag.url_name} />
      </Breadcrumbs>
    );
  }
}
