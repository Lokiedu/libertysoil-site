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
import pick from 'lodash/pick';

import { API_HOST } from '../../../config';
import { PROFILE_HEADER_SIZE } from '../../../consts/profileConstants';
import { getName } from '../../../utils/user';
import ApiClient from '../../../api/client';
import { addError } from '../../../actions/messages';
import { addProfilePost } from '../../../actions/posts';
import UpdatePictureModal from '../../update-picture/update-picture-modal';
import Card from '../card';

function getAction(user) {
  if (user.getIn(['more', 'head_pic'])) {
    return 'Edit';
  }
  return 'Add';
}

const icon = { icon: 'image', pack: 'fa' };
const limits = {
  min: PROFILE_HEADER_SIZE.MIN,
  max: PROFILE_HEADER_SIZE.BIG
};
const submit = { children: 'Save' };

export default class UpdatePictureAction extends React.Component {
  static displayName = 'UpdateProfilePictureAction';

  static propTypes = {
    dispatch: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    triggers: PropTypes.shape({
      uploadPicture: PropTypes.func,
      updateUserInfo: PropTypes.func
    })
  };

  static defaultProps = {
    dispatch: () => {}
  };

  constructor(...args) {
    super(...args);
    this.state = {
      isActive: false,
      isSubmitting: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props ||
      nextState.isActive !== this.state.isActive ||
      nextState.isSubmitting !== this.state.isSubmitting;
  }

  handleCardClick = () => {
    this.setState({ isActive: true });
  };

  handleModalClose = () => {
    this.setState({ isActive: false });
  };

  handleSubmit = async ({ production }) => {
    if (!production || this.state.isSubmitting) {
      return;
    }

    this.setState({ isSubmitting: true });
    const pictureData = {
      picture: production.picture,
      crop: pick(production.crop, ['top', 'right', 'bottom', 'left'])
    };

    try {
      const processed = await this.props.triggers.uploadPicture(pictureData);
      const success = await this.props.triggers.updateUserInfo({
        more: { head_pic: processed }
      });

      const client = new ApiClient(API_HOST);
      const recentPosts = await client.profilePosts(
        this.props.user.get('username'), 0, 1
      );

      if (Array.isArray(recentPosts) && recentPosts.length > 0) {
        this.props.dispatch(addProfilePost(recentPosts[0]));
      }

      if (success) {
        this.handleModalClose();
      }
    } catch (e) {
      this.props.dispatch(addError(e.message));
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const { user } = this.props;
    const action = getAction(user);
    const name = getName(user);

    return (
      <Card
        className="bio__card--bg_1"
        icon={icon}
        title={action.concat(' profile picture')}
        onClick={this.handleCardClick}
      >
        {this.state.isActive &&
          <UpdatePictureModal
            flexible
            limits={limits}
            preview={PROFILE_HEADER_SIZE.PREVIEW}
            visible={this.state.isActive}
            submit={{
              ...submit,
              disabled: this.state.isSubmitting,
              waiting: this.state.isSubmitting
            }}
            what="profile picture"
            where={<span className="">{name}</span>}
            onClose={this.handleModalClose}
            onSubmit={this.handleSubmit}
          />
        }
      </Card>
    );
  }
}
