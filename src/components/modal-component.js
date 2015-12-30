import React, { PropTypes, Component } from 'react';
import _ from 'lodash';

import bem from '../utils/bemClassNames';

const isBrowser = typeof window !== 'undefined';

const SIZES = {
  BIG: 'big',
  NORMAL: 'normal',
  SMALL: 'small'
}

class ModalComponent extends Component {
  static displayName = 'ModalComponent';

  static propTypes = {
    children: PropTypes.any,
    hideCloseButton: PropTypes.bool,
    onHide: PropTypes.func,
    title: PropTypes.string.isRequired,
    size: PropTypes.oneOf(_.values(SIZES))
  }

  static defaultProps = {
    title: '',
    hideCloseButton: false,
    onHide: () => {},
    width: ''
  }

  componentWillMount () {
    isBrowser && window.addEventListener('keydown', this.keyHandler);
  }

  componentWillUnmount () {
    isBrowser && window.removeEventListener('keydown', this.keyHandler);
  }

  keyHandler = (e) => {
    if (e.keyCode ==27) {
      this.hide();
    }
  }

  clickHandler = (e) => {
    e.stopPropagation();
  }

  hide = () => {
    this.props.onHide();
  }

  render () {
    const {
      title,
      size,
      children,
      hideCloseButton,
      className,
      ...props
    } = this.props;
    let pieces = {
      closeButton: false
    };
    let cn = bem.makeClassName({
      block: 'modal',
      modifiers: {
        big: size == SIZES.BIG,
        normal: size == SIZES.NORMAL,
        small: size == SIZES.SMALL
      }
    });

    if (className) {
      cn = `${cn} ${className}`;
    }

    if (!hideCloseButton) {
      pieces.closeButton = <div className="modal__close_area"><div className="micon action" onClick={this.hide}>close</div></div>;
    }

    return (
      <div className={cn} {...props} onClick={this.hide}>
        <div className="modal__section" onClick={this.clickHandler}>
            <div className="modal__section_head">
                <div className="modal__title">{title}</div>
                {pieces.closeButton}
            </div>
            {children}
        </div>
      </div>
    );
  }
}

ModalComponent.body = ({ children }) => (
  <div className="modal__section_description">
    {children}
  </div>
);

ModalComponent.actions = ({ children }) => (
  <div className="modal__navigation">
    {children}
  </div>
);

export default ModalComponent;
