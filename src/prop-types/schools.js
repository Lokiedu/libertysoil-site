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
import PropTypes from 'prop-types';

import { mapOf, uuid4, date, url } from './common';
import { Attachment } from './attachments';
import { TagMore } from './tags';

export const School = PropTypes.shape({
  address1: PropTypes.string,
  address2: PropTypes.string,
  city: PropTypes.string,
  country_id: uuid4,
  created_at: date.isRequired,
  description: PropTypes.string,
  facebook: PropTypes.string,
  foundation_day: PropTypes.number,
  foundation_month: PropTypes.number,
  foundation_year: PropTypes.number,
  house: PropTypes.string,
  id: uuid4.isRequired,
  images: PropTypes.arrayOf(Attachment),
  is_open: PropTypes.bool,
  lat: PropTypes.number,
  lon: PropTypes.number,
  more: TagMore,
  name: PropTypes.string.isRequired,
  number_of_students: PropTypes.number,
  org_membership: PropTypes.shape(),
  phone: PropTypes.string,
  post_count: PropTypes.number.isRequired,
  postal_code: PropTypes.string,
  principal_name: PropTypes.string,
  principal_surname: PropTypes.string,
  required_languages: PropTypes.arrayOf(PropTypes.string),
  teaching_languages: PropTypes.arrayOf(PropTypes.string),
  twitter: PropTypes.string,
  updated_at: date.isRequired,
  url_name: url.isRequired,
  website: PropTypes.string,
  wikipedia: PropTypes.string
});

export const LightSchool = PropTypes.shape({
  id: uuid4.isRequired,
  url_name: url.isRequired,
  name: PropTypes.string.isRequired
});

export const ArrayOfSchools = PropTypes.arrayOf(School);

export const ArrayOfLightSchools = PropTypes.arrayOf(LightSchool);

export const MapOfSchools = mapOf(uuid4, School);

export const SchoolCloud = PropTypes.arrayOf(uuid4);
