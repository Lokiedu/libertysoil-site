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

import UpdatePictureModal from './update-picture-modal';

export default class UpdatePicture extends React.Component {
  static displayName = 'UpdatePicture';

  static propTypes = {
    what: PropTypes.any.isRequired,
    where: PropTypes.any.isRequired,
    limits: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),
    onSubmit: PropTypes.func,
    onClose: PropTypes.func
  };

  static defaultProps = {
    onSubmit: () => {},
    onClose: () => {}
  };

  constructor() {
    super();

    this.state = {
      modalVisible: false
    };
  }

  open = () => {
    this.setState({modalVisible: true});
  };

  submitHandler = (image, crop) => {
    this.pictureUpdateHandler(image, crop, this.props.onSubmit).then(() => {
      this.close();
    });
  };

  close = () => {
    this.setState({modalVisible: false});
    this.props.onClose();
  };

  pictureUpdateHandler = async (image, crop, submit) => {
    await submit(image, crop);
  };

  render() {
    return (
      <div className="">
        <button onClick={this.open} className="update_picture__camera">
          <span className="micon">camera</span>
        </button>
        <UpdatePictureModal
          what={this.props.what}
          where={this.props.where}
          limits={this.props.limits}
          visible={this.state.modalVisible}
          onClose={this.close}
          onSubmit={this.submitHandler}
        />
      </div>
    );
  }
}
