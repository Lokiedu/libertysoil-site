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
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import Link from 'react-router/lib/Link';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { OldIcon as Icon } from './icon';

class SidebarModalMain extends React.PureComponent {
  static displayName = 'SidebarModalMain';

  static propTypes = {
    animate: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    innerClassName: PropTypes.string,
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
    onCloseTo: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]),
    rtl: PropTypes.bool
  };

  static defaultProps = {
    animate: true,
    isVisible: false
  };

  render() {
    let innerClassName = 'sidebar-modal__main';
    if (this.props.innerClassName) {
      innerClassName += ` ${this.props.innerClassName}`;
    }

    const content = (
      <div className={innerClassName} key="main">
        {this.props.children}
      </div>
    );

    let outside;

    const { onClose, onCloseTo } = this.props;
    if (onClose || onCloseTo) {
      outside = (
        <Link
          className="sidebar-modal__outside"
          onClick={onClose}
          to={onCloseTo}
        />
      );
    }

    const cn = classNames(
      'sidebar-modal',
      this.props.className,
      { 'sidebar-modal--rtl': this.props.rtl }
    );

    if (this.props.animate) {
      return (
        <div className={cn}>
          {outside}
          <CSSTransitionGroup
            transitionName="sidebar-modal__main--transition"
            transitionAppear
            transitionAppearTimeout={250}
            transitionEnterTimeout={250}
            transitionLeaveTimeout={250}
          >
            {this.props.isVisible ? content : null}
          </CSSTransitionGroup>
        </div>
      );
    }

    if (!this.props.isVisible) {
      return null;
    }

    return (
      <div className={cn}>
        {outside}{content}
      </div>
    );
  }
}

class SidebarModalOverlay extends React.Component {
  static displayName = 'SidebarModalOverlay';

  static propTypes = {
    color: PropTypes.string,
    isVisible: PropTypes.bool
  };

  static defaultProps = {
    color: "white",
    isVisible: false
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      isAppearing: typeof window === 'undefined',
      isVisible: typeof window === 'undefined'
    };
  }

  componentDidMount() {
    if (this.props.isVisible) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isVisible: true });
    }
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
      [def.concat('--transition_disappear')]: !this.props.isVisible && this.state.isVisible,
      [def.concat('--color_').concat(this.props.color)]: this.props.color
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

  static propTypes = (() => {
    const iconOrNone = PropTypes.oneOfType([
      PropTypes.shape(Icon.propTypes),
      PropTypes.oneOf([false])
    ]);

    return {
      className: PropTypes.string,
      closeIcon: iconOrNone,
      mainIcon: iconOrNone,
      theme: PropTypes.string
    };
  })();

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
          className={classNames('sidebar-modal__icon', mainIconClassName)}
          color="white"
          outline="blue"
          icon="cogs"
          pack="fa"
          size="block"
          round={false}
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

    const className = classNames(
      'sidebar-modal__header',
      this.props.className,
      this.props.theme &&
        `sidebar-modal__header--theme_${this.props.theme}`
    );

    return (
      <div className={className}>
        {mainIcon}
        <div className="sidebar-modal__title">{this.props.children}</div>
        {closeIcon}
      </div>
    );
  }
}

export default {
  Body: SidebarModalBody,
  Header: SidebarModalHeader,
  Main: SidebarModalMain,
  Overlay: SidebarModalOverlay
};
