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
import strftime from 'strftime';

const Time = ({
  title,
  timestamp,
  format,
  ...props
}) => {
  let formattedTime = '';
  let date = new Date();

  if (timestamp) {
    date = new Date(timestamp);
  }

  if (!title) {
    title = date.toUTCString();
  }

  formattedTime = strftime(format, date);

  return (
    <time {...props} dateTime={date.toISOString()} title={title}>
      {formattedTime}
    </time>
  );
};

Time.propTypes = {
  timestamp: React.PropTypes.any,
  format: React.PropTypes.string
};

Time.defaultProps = {
  format: '%B %e, %k:%M'
};

export default Time;
