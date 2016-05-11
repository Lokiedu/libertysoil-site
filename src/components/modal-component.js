import React, { PropTypes, Component } from 'react';
import _ from 'lodash';

import bem from '../utils/bemClassNames';

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
    onHide: PropTypes.func,
    title: PropTypes.string.isRequired,
    size: PropTypes.oneOf(_.values(SIZES))
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

    return (
      <div className={cn} {...props} onClick={this.hide}>
        <div ref={c => this.body = c} className="modal__section" onClick={this.clickHandler}>
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
