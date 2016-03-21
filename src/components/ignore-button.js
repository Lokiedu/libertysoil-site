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
    return <button className="button" onClick={this.clickHandler}>Ignore</button>;
  }
}
