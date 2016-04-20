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
    what: PropTypes.string.isRequired,
    where: PropTypes.string.isRequired,
    limits: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),
    saveHandler: PropTypes.func,
    close: PropTypes.func
  };

  static defaultProps = {
    saveHandler: () => {},
    close: () => {}
  };

  constructor() {
    super();

    this.state = {
      modalVisible: true
    };
  }

  open = () => {
    this.setState({modalVisible: true});
  };

  save = () => {
    this.props.saveHandler();
  };

  close = () => {
    this.setState({modalVisible: false});
  };

  render() {
    const {
      what,
      where,
      limits
    } = this.props;
    
    return (
      <div className="user_box__edit_avatar">
        <button onClick={this.open} style={{position: 'absolute', bottom: '100px', right: '20px'}}>
          <span className="micon">camera</span>
        </button>
        <UpdatePictureModal
          visible={this.state.modalVisible}
          what={what}
          where={where}
          onClose={this.close}
          onSave={this.save}
        />
      </div>
    );
  }
}
