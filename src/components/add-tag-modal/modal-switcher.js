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
import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import TagIcon from '../tag-icon';
import { IMPLEMENTED_TAGS } from '../../consts/tags';

export default class ModalSwitcher extends Component {
  static displayName = 'ModalSwitcher';

  static propTypes = {
    activeType: PropTypes.oneOf(IMPLEMENTED_TAGS).isRequired,
    onClose: PropTypes.func.isRequired,
    onTypeChange: PropTypes.func.isRequired
  };

  _handleTypeChange = (newType) => {
    this.props.onTypeChange(newType);
  };

  render() {
    let {
      activeType,
      onClose
    } = this.props;

    let inactiveTags = _.filter(IMPLEMENTED_TAGS, t => t !== activeType);

    return (
      <div className="modal_switcher">
        {inactiveTags.map((tag, i) => (
          <div className="modal_switcher__item" key={i} onClick={this._handleTypeChange.bind(this, tag)}>
            <TagIcon className="modal_switcher__tag-inactive" type={tag} />
          </div>
        ))}
        <div className="modal_switcher__item" onClick={onClose}>
          <TagIcon big type={activeType} />
        </div>
      </div>
    );
  }

}
