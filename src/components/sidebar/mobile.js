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
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';

import SidebarMenu from '../sidebar-menu';
import TagsInform from '../tags-inform';

function handleClickInside(event) {
  event.stopPropagation();
}

function SidebarMobile(props) {
  return (
    <div
      className="sidebar page__sidebar page__sidebar--side_left page__sidebar--type_main mobile-menu"
      onClick={props.onClose}
    >
      <div className="mobile-menu__section" onClick={handleClickInside}>
        <SidebarMenu current_user={props.current_user} />
        <TagsInform current_user={props.current_user} />
      </div>
    </div>
  );
}

SidebarMobile.propTypes = {
  current_user: PropTypes.shape(),
  onClose: PropTypes.func.isRequired
};

const selector = createSelector(
  currentUserSelector,
  current_user => ({ ...current_user })
);

export default connect(selector)(SidebarMobile);
