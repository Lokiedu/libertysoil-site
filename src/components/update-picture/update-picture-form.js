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
    flexible: PropTypes.bool,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    preview: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }).isRequired
  };

  static defaultProps = {
    onChange: () => {},
    onClear: () => {}
  }

  constructor(props) {
    super(props);

    this.state = {
      image: null,
      avatar: null,
      scale: 1
    };
  }

  _submit = () => {
    if (!this.state.image) {
      return {};
    }

    return { avatar: this.state.avatar, crop: this.editor.getCroppingRect() };
  }

  clearHandler = () => {
    this.setState({ image: null });

    this.props.onClear();
  }

  changeHandler = (event) => {
    const file = event.target.files[0];
    this.setState({
      image: URL.createObjectURL(file),
      avatar: file
    });

    this.props.onChange();
  };

  scaleHandler = () => {
    this.setState({ scale: parseFloat(this.scale.value) });

    this.props.onChange();
  };

  render() {
    const { preview, flexible } = this.props;

    const editorStyle = { cursor: 'move' };
    if (flexible) {
      editorStyle.width = '100%';
    }

    if (this.state.image) {
      return (
        <div className="layout__row">
          <div className="update_picture__editor">
            <Editor
              border={50}
              color={[255, 255, 255, 0.6]}
              height={preview.height}
              image={this.state.image}
              ref={c => this.editor = c}
              scale={this.state.scale}
              style={editorStyle}
              width={preview.width}
            />
          </div>
          <div className="layout layout__row layout-align_center">
            <div className="update_picture__toolbar">
              <span className="update_picture__control micon">remove</span>
              <input className="update_picture__bar" defaultValue="1" max="2" min="1" name="scale" ref={c => this.scale = c} step="0.01" type="range" onChange={this.scaleHandler} />
              <span className="update_picture__control micon">add</span>
            </div>
          </div>
          <div className="layout layout__row">
            <div className="button button-wide action add_tag_modal__cancel_button" onClick={this.clearHandler}>Upload another photo</div>
          </div>
        </div>
      );
    }

    return (
      <div className="layout__row">
        <input className="update_picture__input" type="file" onChange={this.changeHandler} />
      </div>
    );
  }
}
