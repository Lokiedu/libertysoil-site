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
import Editor from '../../external/react-avatar-editor';

export default class UpdatePictureForm extends React.Component {
  static displayName = 'UpdatePictureForm';

  static propTypes = {
    limits: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    })
  };

  static defaultProps = {
    limits: {
      width: 760,
      height: 300
    }
  }

  state = {
    image: null,
    avatar: null,
    scale: 1
  };

  _submit = () => {
    this.setState({image: null});

    return { avatar: this.state.avatar, crop: this.editor.getCroppingRect() };
  }

  changeHandler = (event) => {
    let file = event.target.files[0];
    this.setState({
      image: URL.createObjectURL(file),
      avatar: file
    });
  };

  scaleHandler = () => {
    this.setState({ scale: parseFloat(this.scale.value) })
  };

  render() {
    const { limits } = this.props;

    if (this.state.image) {
      return (
        <div className="layout__row">
          <Editor
            ref={c => this.editor = c}
            border={50}
            color={[255, 255, 255, 0.6]}
            width={limits.width}
            height={limits.height}
            image={this.state.image}
            scale={this.state.scale}
            style={{width: '100%'}}
          />
          <div className="change_avatar_modal__size_box">
            <span className="change_avatar_modal__size_box__icon">-</span>
            <input className="change_avatar_modal__size_box__bar" defaultValue="1" max="2" min="1" name="scale" ref={c => this.scale = c} step="0.01" type="range" onChange={this.scaleHandler} />
            <span className="change_avatar_modal__size_box__icon">+</span>
          </div>
        </div>
      );
    }

    return (
      <div className="layout__row">
        <input className="change_avatar_modal__input" type="file" onChange={this.changeHandler} />
      </div>
    );
  }
}
