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
import { throttle } from 'lodash';

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

  changeHandler = throttle(() => {
    this.setState({error: ''});
  }, 100);

  submitHandler = async () => {
    const { avatar, crop } = this.form._submit();

    if (!avatar) {
      this.setState({error: 'Nothing to preview. Upload image first.'})
    }

    let img = new Image();
    let reader = new FileReader();

    reader.onloadend = (e) => {
      img.src = e.target.result;

      let newCrop = {
        left: crop.x * img.width,
        top: crop.y * img.height,
        right: ((crop.x + crop.width) * img.width),
        bottom: ((crop.y + crop.height) * img.height),
        width: crop.width * img.width,
        height: crop.height * img.height
      };

      if (newCrop.width < 1400) {
        this.setState({
          error: `Image must be at least 1400px in width. Now: ${parseInt(newCrop.width)}px`
        });

        return;
      }

      if (newCrop.height > 2800) {
        this.setState({
          error: `Image mustn't be greater than 2800px in width. Now: ${parseInt(newCrop.width)}px`
        });

        return;
      }

      let canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 400;
      let ctx = canvas.getContext('2d');

      const wRatio = canvas.width / newCrop.width;

      ctx.drawImage(img,
        newCrop.left, newCrop.top, newCrop.width, newCrop.height,
        0, 0, canvas.width, newCrop.height * wRatio
      );

      let src = canvas.toDataURL();

      this.props.onSubmit({
        production: { picture: avatar, crop: newCrop },
        preview: { src: src }
      });
    }

    reader.readAsDataURL(avatar);
  }

  closeHandler = () => {
    this.setState({error: ''});
    this.props.onClose();
  }

  render() {
    const {
      what,
      where,
      limits
    } = this.props;

    if (!this.props.visible) {
      return <script />;
    }
    
    return (
      <ModalComponent size="big" onHide={this.closeHandler}>
        <ModalComponent.Head>
          <ModalComponent.Title>Upload new {what} for {where}</ModalComponent.Title>
        </ModalComponent.Head>
        <ModalComponent.Body>
          { this.state.error &&
            <div className="layout__row">
              <Message message={this.state.error} />
            </div>
          }
          <UpdatePictureForm
            ref={c => this.form = c}
            limits={limits}
            onChange={this.changeHandler}
            onClear={this.changeHandler}
            />
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="layout layout__grid add_tag_modal__footer">
            <div disabled={this.state.error ? true : false} className="button button-wide button-red action" onClick={this.submitHandler}>Preview</div>
            <div className="button button-wide action add_tag_modal__cancel_button" onClick={this.props.onClose}>Cancel</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
