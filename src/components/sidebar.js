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
import { connect } from 'react-redux';
import classNames from 'classnames';

import createSelector from '../selectors/createSelector';

class Sidebar extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    theme: PropTypes.string
  };

  getClassName = () => {
    const { theme, isVisible } = this.props;
    const className = classNames('sidebar col col-xs', {
      'sidebar--visible': isVisible
    });

    const finalize = s =>
      className.concat(` col-${s} col-s-${s} col-m-${s} col-l-${s} col-xl-${s}`);

    switch (theme) {
      case 'trunc': return finalize(1);
      case 'min': return finalize(2);
      case 'ext': return finalize(6);
      default: return finalize(4);
    }
  };

  render() {
    return (
      <div className={this.getClassName()}></div>
    );
  }
}

const selector = createSelector(
  state => state.get('ui'),
  ui => ({ isVisible: ui.get('sidebarIsVisible') })
);

export default connect(selector)(Sidebar);
