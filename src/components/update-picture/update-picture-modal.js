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
import { throttle, pick } from 'lodash';

import ModalComponent from '../modal-component';
import Message from '../message';
import UpdatePictureForm from './update-picture-form';

export default class UpdatePictureModal extends React.Component {
  static displayName = 'UpdatePictureModal';

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    what: PropTypes.any.isRequired,
    where: PropTypes.any.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
  };

  state = {
    error: ''
  }

  validate = (crop) => {
    const { limits } = this.props;

    if (!limits) {
      return true;
    }

    let error = '';
    if (limits.min) {

      if (limits.min.width && (crop.width < limits.min.width)) {
        error = `Image must be at least ${limits.min.width}px in width. Now: ${parseInt(crop.width)}px`;
      }
      if (!error && limits.min.height && (crop.height < limits.min.height)) {
        error = `Image must be at least ${limits.min.height}px in height. Now: ${parseInt(crop.height)}px`;
      }
    }

    if (!error && limits.max) {

      if (limits.max.width && (crop.width > limits.max.width)) {
        error = `Image mustn't be greater than ${limits.max.width}px in width. Now: ${parseInt(crop.width)}px`;
      }
      if (!error && limits.max.height && (crop.height > limits.max.height)) {
        error = `Image mustn't be greater than ${limits.max.height}px in height. Now: ${parseInt(crop.height)}px`;
      }
    }

    this.setState({error});
    return (error == '');
  }

  getPreview = (img, crop) => {
    const { width, height } = this.props.preview;
    const wRatio = width / crop.width;

    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');

    ctx.drawImage(img,
      crop.left, crop.top, crop.width, crop.height,
      0, 0, canvas.width, crop.height * wRatio
    );

    return { url: canvas.toDataURL() };
  };

  changeHandler = throttle(() => {
    this.setState({error: ''});
  }, 100);

  submitHandler = async () => {
    const { avatar, crop } = this.form._submit();

    if (!avatar) {
      this.setState({error: 'Nothing to preview. Upload image first.'});
      return;
    }

    let img = new Image();
    let reader = new FileReader();

    reader.onloadend = (e) => {
      img.src = e.target.result;
    }

    reader.readAsDataURL(avatar);

    img.onload = () => {
      let newCrop = {
        left: crop.x * img.width,
        top: crop.y * img.height,
        right: ((crop.x + crop.width) * img.width),
        bottom: ((crop.y + crop.height) * img.height),
        width: crop.width * img.width,
        height: crop.height * img.height
      };

      const isValid = this.validate(newCrop);
      if (!isValid) {
        return;
      }

      let pictureData = {
        production: { picture: avatar, crop: newCrop }
      };

      if (this.props.preview) {
        pictureData.preview = this.getPreview(img, newCrop);
      }

      this.props.onSubmit(pictureData);
    };
  }

  closeHandler = () => {
    this.setState({error: ''});
    this.props.onClose();
  }

  render() {
    const { what, where } = this.props;

    if (!this.props.visible) {
      return <script />;
    }

    return (
      <ModalComponent ref={c => this.modal = c} size="big" onHide={this.closeHandler}>
        <ModalComponent.Head>
          <ModalComponent.Title>Upload new {what} for {where}</ModalComponent.Title>
        </ModalComponent.Head>
        <ModalComponent.Body className="update_picture__modal">
          { this.state.error &&
            <div className="layout__row">
              <Message message={this.state.error} />
            </div>
          }
          <UpdatePictureForm
            ref={c => this.form = c}
            onChange={this.changeHandler}
            onClear={this.changeHandler}
            {...pick(this.props, ['preview', 'flexible'])}
          />
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="layout layout__grid add_tag_modal__footer">
            <div disabled={!!this.state.error} className="button button-wide button-red action" onClick={this.submitHandler}>Preview</div>
            <div className="button button-wide action add_tag_modal__cancel_button" onClick={this.props.onClose}>Cancel</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
