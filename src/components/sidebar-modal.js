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
import isEqual from 'lodash/isEqual';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';
import Icon from './icon';

class SidebarModalMain extends React.Component {
  static displayName = 'SidebarModalMain';
  static defaultProps = {
    animate: true,
    isVisible: false,
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
    const content = (
      <div
        className={classNames('sidebar-modal sidebar-modal__main', this.props.className)}
        key="main"
        onClick={this.handleClickInside}
      >
        {this.props.children}
      </div>
    );

    if (this.props.animate) {
      return (
        <CSSTransitionGroup
          transitionName="sidebar-modal__main--transition"
          transitionAppear
          transitionAppearTimeout={250}
          transitionLeaveTimeout={250}
        >
          {this.props.isVisible ? content : null}
        </CSSTransitionGroup>
      );
    }

    return this.props.isVisible ? content : null;
  }
}

class SidebarModalOverlay extends React.Component {
  static displayName = 'SidebarModalOverlay';
  static defaultProps = {
    isVisible: false
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isAppearing: false,
      isVisible: props.isVisible
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isVisible && this.props.isVisible) {
      setTimeout(() => this.setState({ isVisible: false, isAppearing: false }), 250);
    } else if (nextProps.isVisible && !this.props.isVisible) {
      this.setState({ isVisible: true });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || !isEqual(nextState, this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isVisible && this.state.isVisible) {
      setTimeout(() => this.setState({ isAppearing: true }), 60);
    }
  }

  render() {
    const def = 'sidebar-modal__overlay';
    const cn = classNames('sidebar-modal', def, this.props.className, {
      [def.concat('--transition_appear')]: this.state.isAppearing,
      [def.concat('--transition_disappear')]: !this.props.isVisible && this.state.isVisible
    });

    const content = <div className={cn}>{this.props.children}</div>;

    if (!this.props.isVisible) {
      return this.state.isVisible ? content : null;
    }

    return content;
  }
}

class SidebarModalBody extends React.Component {
  static displayName = 'SidebarModalBody';
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const className = classNames(
      this.props.className,
      { 'sidebar-modal__body': !this.props.raw }
    );

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

class SidebarModalHeader extends React.Component {
  static displayName = 'SidebarModalHeader';

  static defaultProps = {
    closeIcon: {},
    mainIcon: {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    let mainIcon;
    if (this.props.mainIcon !== false) {
      const { className: mainIconClassName, ...props } = this.props.mainIcon;
      mainIcon = (
        <Icon
          className={classNames('sidebar-modal__icon icon-outline--square', mainIconClassName)}
          color="white"
          outline="blue"
          icon="cogs"
          pack="fa"
          size="common"
          {...props}
        />
      );
    }

    let closeIcon;
    if (this.props.closeIcon !== false) {
      const { className: closeIconClassName, ...props } = this.props.closeIcon;
      closeIcon = (
        <Icon
          className={classNames('action sidebar-modal__close', closeIconClassName)}
          icon="close"
          pack="fa"
          size="common"
          {...props}
          onClick={this.props.onClose}
        />
      );
    }

    return (
      <div className={classNames('sidebar-modal__header', this.props.className)}>
        {mainIcon}
        <div className="sidebar-modal__title">{this.props.children}</div>
        {closeIcon}
      </div>
    );
  }
}

const SidebarModal = ClickOutsideComponentDecorator(SidebarModalMain);
SidebarModal.Body = SidebarModalBody;
SidebarModal.Header = SidebarModalHeader;
SidebarModal.Overlay = SidebarModalOverlay;
export default SidebarModal;
