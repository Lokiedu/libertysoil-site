
import React, { Component, PropTypes } from 'react';

export default class VisibilitySensor extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    delay: PropTypes.number,
    active: PropTypes.bool
  };

  static defaultProps = {
    delay: 1000,
    active: true,
    onUnmount: () => {}
  };

  watch = null;
  wasVisible = null;

  toggleCheck() {
    switch (this.props.active) {
      case true: {
        if (!this.watch) {
          this.watch = setInterval(this.checkVisibility, this.props.delay);
        }
        break;
      }
      case false: {
        if (this.watch) {
          clearInterval(this.watch);
          this.watch = null;
        }
        break;
      }
    }
  }

  componentDidMount() {
    this.toggleCheck();
  }

  componentWillReceiveProps() {
    this.toggleCheck();
  }

  componentWillUnmount() {
    if (this.watch) {
      clearInterval(this.watch);
      this.props.onChange(false);
    }
  }

  checkVisibility = () => {
    const pos = this.node.getBoundingClientRect();
    const win = { width: window.outerWidth, height: window.outerHeight };
    function check(p = 0, w = 0) {
      return ((w - p > 0) && (p - w < w));
    }
    
    let isVisible;

    if (!pos.width) {
      isVisible = false;
    } else {
      switch (check(pos.top, win.height) || check(pos.bottom, win.height)) {
        case true: {
          if (check(pos.right, win.width) || check(pos.left, win.width)) {
            isVisible = true;
          } else {
            isVisible = false;
          }
          break;
        }

        case false: {
          isVisible = false;
          break;
        }
      }
    }

    if ((typeof this.wasVisible !== 'object') && (isVisible !== this.wasVisible)) {
      this.props.onChange(isVisible);
    }
    this.wasVisible = isVisible;
  };

  render() {
    return (
      <div ref={(c) => this.node = c} className="visibility_sensor">
        {this.props.children}
      </div>
    );
  }
}
