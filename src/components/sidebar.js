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

import createSelector from '../selectors/createSelector';
import currentUserSelector from '../selectors/currentUser';

import SidebarMenu from './sidebar-menu';
import TagsInform from './tags-inform';

class Sidebar extends React.Component {
  static propTypes = {
    theme: PropTypes.string
  };

  static defaultProps = {
    isFixed: true
  };

  getClassName = () => {
    const finalize = s =>
      `sidebar col col-xs col-${s} col-s-${s} col-m-${s} col-l-${s} col-xl-${s}`;

    switch (this.props.theme) {
      case 'trunc': return finalize(1);
      case 'min': return finalize(2);
      case 'ext': return finalize(6);
      default: return finalize(4);
    }
  };

  render() {
    return (
      <div className={this.getClassName()}>
        <SidebarMenu current_user={this.props.current_user} />
        <TagsInform current_user={this.props.current_user} />
      </div>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('ui'),
  (current_user, ui) => ({
    isVisible: ui.get('sidebarIsVisible'), // FIXME: mobile version
    ...current_user
  })
);

export default connect(selector)(Sidebar);
