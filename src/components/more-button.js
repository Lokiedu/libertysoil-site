import React, { PropTypes } from 'react';

export default class MoreButton extends React.Component {
  static displayName = 'MoreButton';

  static propTypes = {
    className: PropTypes.string,
    expanded: React.PropTypes.bool
  };

  static defaultProps = {
    className: '',
    expanded: false
  };

  render() {
    let { className, ...props } = this.props;
    let text = 'more_horiz';

    className = `more_button micon ${className}`;

    if (this.props.expanded) {
      text = 'more_vert';
    }

    return <div className={className} type="button" {...props}>{text}</div>;
  }
}
