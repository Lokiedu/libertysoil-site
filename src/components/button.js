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
    const {
      color,
      size,
      className,
      waiting,
      title,
      ...props
    } = this.props;
    let icon = null;

    let cn = `button button-icon action ${className}`;

    if (color) {
      cn += ` button-${color}`;
    }

    if (size) {
      cn += ` button-${size}`;
    }

    if (waiting) {
      cn += ` button-waiting`;
      icon = <span className="button__icon micon micon-rotate">refresh</span>;
    }

    return (
      <button className={cn} title={title} {...props}>
        {icon}
        {title}
      </button>
    );
  }
}
