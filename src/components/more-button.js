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
    className = `more_button micon ${this.props.className}`;

    if (this.props.expanded) {
      return <div className={className} type="button" {...props}>more_vert</div>;
    } else {
      return <div className={className} type="button" {...props}>more_horiz</div>;
    }
  }
}
