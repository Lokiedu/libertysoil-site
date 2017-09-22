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

import UpdatePictureModal from './update-picture-modal';

export default class UpdatePicture extends React.Component {
  static displayName = 'UpdatePicture';

  static propTypes = {
    flexible: PropTypes.bool,
    limits: PropTypes.shape({
      min: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
      }),
      max: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
      })
    }),
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    preview: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }).isRequired,
    what: PropTypes.node.isRequired,
    where: PropTypes.node.isRequired
  };

  static defaultProps = {
    onSubmit: () => {},
    onClose: () => {}
  };

  state = {
    modalVisible: false
  };

  open = () => {
    this.setState({ modalVisible: true });
  };

  submitHandler = ({ production, preview }) => {
    this.props.onSubmit({ production, preview }).then(() => {
      this.close();
    });
  };

  close = () => {
    this.setState({ modalVisible: false });
    this.props.onClose();
  };

  render() {
    const { flexible, limits, preview, what, where } = this.props;
    return (
      <div className="update_picture">
        <button className="update_picture__camera" onClick={this.open}>
          <span className="micon">camera</span>
        </button>
        <UpdatePictureModal
          visible={this.state.modalVisible}
          flexible={flexible}
          limits={limits}
          preview={preview}
          what={what}
          where={where}
          onClose={this.close}
          onSubmit={this.submitHandler}
        />
      </div>
    );
  }
}
