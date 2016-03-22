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
import React, { PropTypes, Component } from 'react';
import AvatarEditor from '../../external/react-avatar-editor';

import ModalComponent from '../modal-component';


export default class ChangeAvatarModal extends Component {
  static displayName = 'ChangeAvatarModal';

  static propTypes = {
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    visible: PropTypes.bool
  };

  static defaultProps = {
    visible: false,
    onClose: () => {},
    onSave: () => {}
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

  onChange = (event) => {
    let file = event.target.files[0];
    this.setState({
      image: URL.createObjectURL(file),
      avatar: file
    });
  };

  handleScale = () => {
    this.setState({ scale: parseFloat(this.refs.scale.value) })
  };

  close = () => {
    this.setState({image: null});
    this.props.onClose();
  };

  save = () => {
    this.setState({image: null});
    this.props.onSave(this.state.avatar, this.refs.avatar.getCroppingRect());
  };

  editor() {
    return this.state.image ? (
            <div>
              <AvatarEditor
                border={50}
                color={[255, 255, 255, 0.6]} // RGBA
                height={350}
                image={this.state.image}
                ref="avatar"
                scale={this.state.scale}
                width={350}
              />
              <div className="change_avatar_modal__size_box">
                <span className="change_avatar_modal__size_box__icon">-</span>
                <input className="change_avatar_modal__size_box__bar" defaultValue="1" max="2" min="1" name="scale" ref="scale" step="0.01" type="range" onChange={this.handleScale} />
                <span className="change_avatar_modal__size_box__icon">+</span>
              </div>
            </div>
          ) : (<input className="change_avatar_modal__input" type="file" onChange={this.onChange} />);
  }


  render () {

    if (!this.props.visible) {
      return null;
    }

    return (
      <ModalComponent
        className="change_avatar_modal"
        size="normal"
        onHide={this.close}
      >
        <ModalComponent.Head>
          <ModalComponent.Title>Choose your user picture</ModalComponent.Title>
        </ModalComponent.Head>
        <ModalComponent.Body>
          <div className="change_avatar_modal__editor">
            {this.editor()}
          </div>
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="change_avatar_modal__footer">
            <div className="button button-wide button-red button-centered action" onClick={this.save}>Save</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
