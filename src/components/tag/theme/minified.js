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
import classNames from 'classnames';

import RawTag from '../raw';

// not to instantiate new {} every time MinifiedTag renders, {} !== {}
const emptyObject = {};

const MinifiedTag = ({ className, name, ...props }) => {
  const cn = classNames(className, 'tag', 'tag--theme_minified');
  const finalName = {
    ...name,
    className: classNames('tag__name', name.className)
  };

  return (
    <RawTag
      {...props}
      aside={false}
      className={cn}
      icon={emptyObject}
      name={finalName}
    />
  );
};

MinifiedTag.propTypes = {
  className: PropTypes.string,
  name: PropTypes.shape({})
};

MinifiedTag.defaultProps = {
  name: {}
};

export default MinifiedTag;
