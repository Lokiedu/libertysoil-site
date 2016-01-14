/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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

import ChangeAvatarModal from './change-avatar-modal';

class ChangeAvatar extends React.Component {
  static displayName = 'ChangeAvatar';

  static propTypes = {
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      image: null,
      scale: 1,
      avatar: null,
      modalVisible: false
    };
  }

  openModal = () => {
    this.setState({modalVisible: true});
  }

  closeModal = () => {
    this.setState({modalVisible: false});
  }

  submit = (image, crop) => {
    this.props.onChange(image, crop);
    this.closeModal();
  }

  render() {
    return (
      <div className="user_box__edit_avatar">
        <button onClick={this.openModal}>
          <span className="micon">camera</span>
        </button>
        <ChangeAvatarModal
          visible={this.state.modalVisible}
          onClose={this.closeModal}
          onSave={this.submit}
        />
      </div>
    );
  }
}


export default ChangeAvatar;
