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
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { values } from 'lodash';
import classNames from 'classnames';

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
      sectionClassName,
      ...props
    } = this.props;

    const cn = classNames('modal', className, {
      'modal-big': size === SIZES.BIG,
      'modal-normal': size === SIZES.NORMAL,
      'modal-small': size === SIZES.SMALL
    });

    return (
      <div className={cn} {...props} onClick={this.hide}>
        <div
          className={classNames('modal__section', sectionClassName)}
          ref={c => this.body = c}
          onClick={this.clickHandler}
        >
          {children}
        </div>
      </div>
    );
  }
}

const Head = ({ children, className }) => (
  <div className={classNames('modal__section_head', className)}>
    {children}
  </div>
);

const Title = ({ children, className }) => (
  <h4 className={classNames('modal__title', className)}>
    {children}
  </h4>
);

const Body = ({ children, className }) => (
  <div className={classNames('modal__section_description', className)}>
    {children}
  </div>
);

const Actions = ({ children, className }) => (
  <div className={classNames('modal__navigation', className)}>
    {children}
  </div>
);

ModalComponent.Head = Head;
ModalComponent.Title = Title;
ModalComponent.Body = Body;
ModalComponent.Actions = Actions;

export default ModalComponent;
