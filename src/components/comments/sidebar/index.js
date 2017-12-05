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
import { Comment as CommentPropType } from '../../../prop-types/comments';
import createSelector from '../../../selectors/createSelector';
import currentUserSelector from '../../../selectors/currentUser';
import { ActionsTrigger } from '../../../triggers';
import { appear, disappear } from '../../../utils/transition';

import Modal from '../../sidebar-modal';
import Comments from '../../post/comments';

class SidebarComments extends React.PureComponent {
  static displayName = 'SidebarComments';

  static propTypes = {
    comments: PropTypes.arrayOf(CommentPropType),
    current_user: PropTypes.shape(),
    dispatch: PropTypes.func.isRequired,
    is_logged_in: PropTypes.bool,
    location: PropTypes.shape(),
    onClose: PropTypes.func,
    post: PropTypes.shape(),
    ui: PropTypes.shape(),
    users: PropTypes.shape()
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

  componentWillMount() {
  }

  render() {
    if (!this.props.is_logged_in) {
      return false;
    }
    if (!this.props.comments) {
      return false;
    }

    const { ui, onClose } = this.props;
    const rtl = SUPPORTED_LOCALES[ui.get('locale')].rtl;

    return (
      <div>
        <Modal.Overlay isVisible={this.state.isVisible} version={4}>
          <Modal.Main
            innerClassName="form__container sidebar-form__container form__main"
            isVisible={this.state.isVisible}
            rtl={rtl}
            version={4}
            onCloseTo={onClose && onClose.to}
          >
            <Modal.Body raw>
              <Comments
                comments={this.props.comments}
                current_user={this.props.current_user}
                post={this.props.post}
                triggers={this.triggers}
                ui={this.props.ui}
                users={this.props.users}
              />
            </Modal.Body>
          </Modal.Main>
        </Modal.Overlay>
      </div>
    );
  }
}

const mapStateToProps = createSelector(
  (state, props) => state.getIn([
    'comments', props.postId || props.location.query.post_id
  ]),
  currentUserSelector,
  (state, props) => {
    const postId = props.postId || props.location.query.post_id;

    if (!props.location.query.include_post) {
      return ImmutableMap({
        comment_count: state.getIn(['posts', postId, 'comment_count']),
        id: postId
      });
    }

    return state.getIn(['posts', postId]);
  },
  state => state.get('ui'),
  state => state.get('users'),
  (comments, current_user, post, ui, users) => ({
    comments,
    ...current_user,
    post,
    ui,
    users
  })
);

export default connect(
  mapStateToProps, null, null, { withRef: true }
)(SidebarComments);
