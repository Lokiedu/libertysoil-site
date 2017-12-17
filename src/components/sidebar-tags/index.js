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
import { SUPPORTED_LOCALES } from '../../consts/localization';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { ActionsTrigger } from '../../triggers';
import { appear, disappear } from '../../utils/transition';

import Modal from '../sidebar-modal';

import FlatList from './flat-list';
import GroupedList from './grouped-list';
import SingleTag from './single';

class SidebarTags extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape().isRequired
  };

  static TRANSITION_TIMEOUT = 250;

  constructor(props, context) {
    super(props, context);
    this.state = {
      isVisible: true
    };

    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );

    this.componentWillAppear =
      appear.bind(this, SidebarTags.TRANSITION_TIMEOUT);
    this.componentWillEnter =
      appear.bind(this, SidebarTags.TRANSITION_TIMEOUT);
    this.componentWillLeave =
      disappear.bind(this, SidebarTags.TRANSITION_TIMEOUT);
  }

  handleClose = () => {

  };

  render() {
    if (!this.props.is_logged_in) {
      return false;
    }

    const { onClose } = this.props;
    const { isVisible } = this.state;

    const { rtl } = SUPPORTED_LOCALES[this.props.locale];
    const { query } = this.props.location;

    let children;

    switch (query.view) {
      case 'grouped': {
        children = <GroupedList {...this.props} />;
        break;
      }
      case 'flat': {
        children = <FlatList {...this.props} />;
        break;
      }
      case 'single': {
        children = <SingleTag {...this.props} />;
        break;
      }
    }

    return (
      <div>
        <Modal.Overlay isVisible={isVisible} version={4}>
          <Modal.Main
            isVisible={isVisible}
            rtl={rtl}
            version={4}
            onCloseTo={onClose && onClose.to}
          >
            {children}
          </Modal.Main>
        </Modal.Overlay>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  state => state.getIn(['ui', 'locale']),
  (is_logged_in, locale) => ({
    is_logged_in,
    locale
  })
);

export default connect(mapStateToProps)(SidebarTags);
