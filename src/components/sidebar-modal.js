/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import React from 'react';
import classNames from 'classnames';

import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';
import Icon from './icon';

class SidebarModalMain extends React.Component {
  static displayName = 'SidebarModalMain';
  static defaultProps = {
    onHide: () => {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  onClickOutside = () => {
    this.props.onHide();
  };

  handleClickInside = (e) => {
    e.stopPropagation();
  };

  render() {
    return (
      <div
        className={classNames('sidebar-modal sidebar-modal__main', this.props.className)}
        onClick={this.handleClickInside}
      >
        {this.props.children}
      </div>
    );
  }
}

class SidebarModalOverlay extends React.Component {
  static displayName = 'SidebarModalOverlay';
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className={classNames('sidebar-modal sidebar-modal__overlay', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

class SidebarModalBody extends React.Component {
  static displayName = 'SidebarModalBody';
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className={classNames('sidebar-modal__body', this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

class SidebarModalHeader extends React.Component {
  static displayName = 'SidebarModalHeader';

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <div className={classNames('sidebar-modal__header', this.props.className)}>
        <Icon
          className="icon-outline--square"
          color="white"
          outline="blue"
          icon="cogs"
          pack="fa"
          size="common"
        />
        <div className="sidebar-modal__title">{this.props.children}</div>
        <Icon
          className="action sidebar-modal__close"
          icon="close"
          pack="fa"
          size="common"
          onClick={this.props.onClose}
        />
      </div>
    );
  }
}

const SidebarModal = ClickOutsideComponentDecorator(SidebarModalMain);
SidebarModal.Body = SidebarModalBody;
SidebarModal.Header = SidebarModalHeader;
SidebarModal.Overlay = SidebarModalOverlay;
export default SidebarModal;
