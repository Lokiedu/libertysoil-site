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
import React from 'react';
import noop from 'lodash/noop';

import Button from './button';
import VisibilitySensor from './visibility-sensor';

export default class LoadMore extends React.Component {
  static defaultProps = {
    waiting: false,
    onClick: noop,
    onVisibilityChange: noop
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className="layout layout-align_center layout__space layout__space-double">
        <VisibilitySensor onChange={this.props.onVisibilityChange}>
          <Button
            title="Load more..." waiting={this.props.waiting}
            onClick={this.props.onClick}
          />
        </VisibilitySensor>
      </div>
    );
  }
}
