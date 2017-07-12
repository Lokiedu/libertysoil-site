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
import { OldIcon as Icon } from './icon';

const ICON_SIZE = { inner: 'lm', outer: 'm' };

export default class IgnoreButton extends React.Component {
  static displayName = 'IgnoreButton';

  static propTypes = {
    onClick: React.PropTypes.func.isRequired,
    user: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    })
  };

  clickHandler = (e) => {
    e.preventDefault();
    this.props.onClick(this.props.user);
  };

  render() {
    return (
      <Icon
        className="suggested-user__button suggested-user__button-ignore button-light_gray action"
        icon="angle-right"
        pack="fa"
        size={ICON_SIZE}
        title="Ignore"
        onClick={this.clickHandler}
      />
    );
  }
}
