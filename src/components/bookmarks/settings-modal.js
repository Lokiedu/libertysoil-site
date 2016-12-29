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
import classNames from 'classnames';

import Modal from '../modal-component';

const BookmarkSettingsModal = ({ className, isVisible, onClose, children, title, ...props }) => {
  const cn = classNames(className, {
    hidden: !isVisible
  });
  return (
    <Modal className={cn} containerClassName="bg_color--lightgray" onHide={onClose} {...props}>
      <Modal.Head>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Head>
      <Modal.Body>
        {children}
      </Modal.Body>
    </Modal>
  );
};

BookmarkSettingsModal.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
  isVisible: PropTypes.bool,
  onClose: PropTypes.func
};

BookmarkSettingsModal.defaultProps = {
  isVisible: false,
  onClose: () => {}
};

export default BookmarkSettingsModal;
