import React, { PropTypes } from 'react';

export default class Button extends React.Component {
  static displayName = 'Button';

  static propTypes = {
    color: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.string
  };

  static defaultProps = {
    color: 'green',
    className: ''
  };

  render() {
    let {
      color,
      size,
      className,
      title,
      waiting,
      ...props
    } = this.props;
    let icon = null;

    className = `button button-icon action ${className}`;

    if (color) {
      className += ` button-${color}`;
    }

    if (size) {
      className += ` button-${size}`;
    }

    if (waiting) {
      className += ` button-waiting`;
      icon = <span className="button__icon micon micon-rotate">refresh</span>;
    }

    return (
      <button className={className} {...props}>
        {icon}
        {title}
      </button>
    );
  }
}
