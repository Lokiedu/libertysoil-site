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
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { ActionsTrigger } from '../../triggers';

import LoadableRiver from '../loadable-river';
import Modal from '../sidebar-modal';

class SidebarGroupedTagList extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      isVisible: true
    };

    const client = new ApiClient(API_HOST);
    this.triggers = new ActionsTrigger(client, props.dispatch);
  }

  componentDidMount() {
    this.triggers.loadAllTags();
  }

  render() {
    return (
      <div>
        <Modal.Navigation>
          
        </Modal.Navigation>
        <Modal.Body>
          <LoadableRiver
            
          />
        </Modal.Body>
      </div>
    );
  }
}

const selectGroupedTagRiver = (state, props) => {
  const qs = queryToTagRiverQueryString();
  return state.getIn(['rivers', 'sidebar_tags', 'grouped', qs]);
};

const mapStateToProps = createSelector(
  currentUserSelector,
  selectGroupedTagRiver,
  (current_user) => ({
    ...current_user,

  })
);

export default connect(mapStateToProps)(SidebarGroupedTagList);
