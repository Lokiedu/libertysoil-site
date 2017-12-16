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
import { Map as ImmutableMap } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ApiClient from '../../../api/client';
import { API_HOST } from '../../../config';
import { SUPPORTED_LOCALES } from '../../../consts/localization';
import createSelector from '../../../selectors/createSelector';
import currentUserSelector from '../../../selectors/currentUser';
import { ActionsTrigger } from '../../../triggers';
import { appear, disappear } from '../../../utils/transition';

import Modal from '../../../components/sidebar-modal';

class SidebarComments extends React.PureComponent {
  static displayName = 'SidebarComments';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    is_logged_in: PropTypes.bool,
    location: PropTypes.shape()
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

    const T = SidebarComments;
    this.componentWillAppear = appear.bind(this, T.TRANSITION_TIMEOUT);
    this.componentWillEnter = appear.bind(this, T.TRANSITION_TIMEOUT);
    this.componentWillLeave = disappear.bind(this, T.TRANSITION_TIMEOUT);
  }

  render() {
    if (!this.props.is_logged_in) {
      return false;
    }

    const { onClose } = this.props;
    const rtl = SUPPORTED_LOCALES[this.props.locale].rtl;

    return (
      <div>
        <Modal.Overlay isVisible={this.state.isVisible} version={4}>
          <Modal.Main
            innerClassName="form__container sidebar-form__container form__main"
            isVisible={this.state.isVisible}
            rtl={rtl}
            version={2}
            onCloseTo={onClose && onClose.to}
          >
            <Modal.Body raw>
              {this.props.comments.map(() => {})}
            </Modal.Body>
          </Modal.Main>
        </Modal.Overlay>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  currentUserSelector,
  state => state.getIn(['ui', 'locale']),
  (state, props) => state.getIn([
    'comments', props.postId || props.location.query.post_id
  ]),
  (state, props) => {
    if (!props.location.query.include_post) {
      return ImmutableMap();
    }

    return state.get([
      'posts', props.postId || props.location.query.post_id
    ]);
  },
  (current_user, locale, comments, post) => ({
    ...current_user,
    locale,
    comments,
    post
  })
);

export default connect(
  mapStateToProps, null, null, { withRef: true }
)(SidebarComments);
