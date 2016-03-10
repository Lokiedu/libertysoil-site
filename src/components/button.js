import React, { PropTypes } from 'react';

export default class Button extends React.Component {
  static displayName = 'Button';

  static propTypes = {
    color: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    color: 'green',
    className: ''
  };

  render() {
    let {
      color,
      className,
      title,
      waiting,
      ...props
    } = this.props;
    let icon = null;

    className = `button button-icon action ${className}`;

    if (color) {
      className += `button-${color}`;
    }

    if (waiting) {
      className += ` button-waiting`;
      icon = <span className="button__icon micon micon-rotate">refresh</span>;
    }

    return (
      <div className={className} {...props}>
        {icon}
        {title}
      </div>
    );
  }
}
