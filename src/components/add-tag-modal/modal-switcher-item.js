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

import TagIcon from '../tag-icon';

export default class ModalSwitcherItem extends React.Component {
  static displayName = 'ModalSwitcherItem';

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    tag: PropTypes.string.isRequired
  };

  static defaultProps = {
    onClick: () => {}
  };

  onClick = () => {
    this.props.onClick(this.props.tag);
  };

  render() {
    const { tag } = this.props;

    return (
      <div className="modal_switcher__item" onClick={this.onClick}>
        <TagIcon className="modal_switcher__tag-inactive" type={tag} />
      </div>
    );
  }
}
