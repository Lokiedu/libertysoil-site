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

import ModalComponent from './modal-component';
import UpdatePictureForm from './update-picture-form';

export default class UpdatePicture extends React.Component {
  static displayName = 'UpdatePicture';

  static propTypes = {
    what: PropTypes.string.isRequired,
    where: PropTypes.string.isRequired,
    limits: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),
    save: PropTypes.func,
    close: PropTypes.func
  };

  static defaultProps = {
    save: () => {},
    close: () => {}
  };

  constructor() {
    super();

    this.state = {

    };
  }

  save = () => {
    this.props.save();
  };

  close = () => {
    this.props.close();
  };

  render() {
    const {
      what,
      where,
      limits
    } = this.props;

    return (
      <ModalComponent size="normal" onHide={this._handleClose}>
        <ModalComponent.Head>
          <ModalComponent.Title>Upload new {what} for {where}</ModalComponent.Title>
        </ModalComponent.Head>
        <ModalComponent.Body>
          <UpdatePictureForm limits={limits} onAdd={this.add} />
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="layout layout__grid add_tag_modal__footer">
            <div className="button button-wide button-red action" onClick={this.save}>Save</div>
            <div className="button button-wide action add_tag_modal__cancel_button" onClick={this.close}>Cancel</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
