/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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

import { OldIcon as Icon } from '../icon';

const ICON_SIZE = { inner: 'xxl', outer: 'l' };

export default function BioCard({ className, icon, onClick, title, children }) {
  return (
    <div className={classNames('bio__card bio-card', className)}>
      <div className="bio-card__container" onClick={onClick}>
        <Icon size={ICON_SIZE} {...icon} className={classNames('bio-card__icon', icon.className)} />
        <div className="bio-card__title">{title}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

BioCard.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.shape(),
  onClick: PropTypes.func,
  title: PropTypes.node
};

BioCard.defaultProps = {
  icon: {}
};
