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
import Modal from 'react-modal';
import AvatarEditor from 'react-avatar-editor';

class ChangeAvatar extends React.Component {
  static displayName = 'ChangeAvatar';

  static propTypes = {
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
    	modalIsOpen: false,
      image: null,
      scale: 1,
      avatar: null
    };
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false, image: null});
  }

  onChange = (event) => {
    let file = event.target.files[0];
    this.setState({
      image: URL.createObjectURL(file),
      avatar: file
    });
  }

  handleScale = () => {
    this.setState({scale: this.refs.scale.value})
  }

  submit = () => {
    let crop = this.refs.avatar.getCroppingRect();
    this.props.onChange(this.state.avatar, crop);
    this.closeModal();
  }

  editor() {
    return this.state.image ? (
            <div>
              <AvatarEditor
              ref="avatar"
              image={this.state.image}
              width={350}
              height={350}
              border={50}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={this.state.scale} />
              <div className="user_box__avatar_modal__size_box">
                <label className="user_box__avatar_modal__size_box__icon">-</label>
                <input className="user_box__avatar_modal__size_box__bar" name="scale" type="range" ref="scale" onChange={this.handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                <label className="user_box__avatar_modal__size_box__icon">+</label>
              </div>
              <div>
                <button className="button button-green action" onClick={this.submit}>Update Avatar</button>
              </div>
            </div>
          ) : (<input type="file" onChange={this.onChange} />);
  }

  render() {
    return (
      <div className="user_box__edit_avatar">
        <button onClick={this.openModal}>
          <span className="micon">camera</span>
        </button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={
            {
              content: {
                left: '0',
                right: '0',
                width: '90%',
                margin: '0 auto',
                maxWidth: '600px',
                textAlign: 'center'
              }
            }
          }
          >
          <div className="user_box__avatar_modal modal">

          <h2 className="content__sub_title layout__row">Change your avatar</h2>
          <button className="modal__close" onClick={this.closeModal}>
            <span className="micon">close</span>
          </button>
          <div>
            {this.editor()}
          </div>
          </div>
        </Modal>
      </div>
    );
  }
}


export default ChangeAvatar;
