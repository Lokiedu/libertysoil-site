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
import { filter } from 'lodash';

import { IMPLEMENTED_TAGS } from '../deps';
import { TagIcon } from '../deps';

import ModalSwitcherItem from './item';

const ModalSwitcher = ({ activeType, onClose, onTypeChange }) => {
  const inactiveTags = filter(IMPLEMENTED_TAGS, t => t !== activeType);

  return (
    <div className="modal_switcher">
      {inactiveTags.map((tag, i) => (
        <ModalSwitcherItem key={i} tag={tag} onClick={onTypeChange} />
      ))}
      <div className="modal_switcher__item" onClick={onClose}>
        <TagIcon big type={activeType} />
      </div>
    </div>
  );
};

ModalSwitcher.displayName = 'ModalSwitcher';

ModalSwitcher.propTypes = {
  activeType: PropTypes.oneOf(IMPLEMENTED_TAGS).isRequired,
  onClose: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired
};

export default ModalSwitcher;
