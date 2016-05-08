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
import { pick } from 'lodash';

import UpdatePictureModal from './update-picture-modal';

export default class UpdatePicture extends React.Component {
  static displayName = 'UpdatePicture';

  static propTypes = {
    what: PropTypes.any.isRequired,
    where: PropTypes.any.isRequired,
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
    preview: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }).isRequired,
    onSubmit: PropTypes.func,
    onClose: PropTypes.func
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
    return (
      <div className="update_picture">
        <button onClick={this.open} className="update_picture__camera">
          <span className="micon">camera</span>
        </button>
        <UpdatePictureModal
          visible={this.state.modalVisible}
          onClose={this.close}
          onSubmit={this.submitHandler}
          {...pick(this.props, ['what', 'where', 'limits', 'preview', 'flexible'])}
        />
      </div>
    );
  }
}
