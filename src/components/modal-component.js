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
import React, { PropTypes, Component } from 'react';
import { values } from 'lodash';

const isBrowser = typeof window !== 'undefined';

const SIZES = {
  BIG: 'big',
  NORMAL: 'normal',
  SMALL: 'small'
};

class ModalComponent extends Component {
  static displayName = 'ModalComponent';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onHide: PropTypes.func,
    size: PropTypes.oneOf(values(SIZES)),
    title: PropTypes.string.isRequired
  };

  static defaultProps = {
    title: '',
    onHide: () => {},
    width: ''
  };

  componentWillMount() {
    isBrowser && window.addEventListener('keydown', this.keyHandler);
  }

  componentWillUnmount() {
    isBrowser && window.removeEventListener('keydown', this.keyHandler);
  }

  keyHandler = (e) => {
    if (e.keyCode == 27) {
      this.hide();
    }
  };

  clickHandler = (e) => {
    e.stopPropagation();
  };

  hide = (e) => {
    this.props.onHide(e);
  };

  getWidth() {
    return {
      width: this.body.offsetWidth,
      height: this.body.offsetHeight
    };
  }

  render() {
    const {
      size,
      children,
      className,
      ...props
    } = this.props;

    const cn = classNames('modal', className, {
      'modal-big': size === SIZES.BIG,
      'modal-normal': size === SIZES.NORMAL,
      'modal-small': size === SIZES.SMALL
    });

    return (
      <div className={cn} {...props} onClick={this.hide}>
        <div className="modal__section" ref={c => this.body = c} onClick={this.clickHandler}>
          {children}
        </div>
      </div>
    );
  }
}

const Head = ({ children }) => (
  <div className="modal__section_head">
    {children}
  </div>
);

const Title = ({ children }) => (
  <h4 className="modal__title">
    {children}
  </h4>
);

const Body = ({ children }) => (
  <div className="modal__section_description">
    {children}
  </div>
);

const Actions = ({ children }) => (
  <div className="modal__navigation">
    {children}
  </div>
);

ModalComponent.Head = Head;
ModalComponent.Title = Title;
ModalComponent.Body = Body;
ModalComponent.Actions = Actions;

export default ModalComponent;
