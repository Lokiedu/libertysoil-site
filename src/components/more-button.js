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
    const { className, ...props } = this.props;
    const cn = `more_button micon ${className}`;

    let text = 'more_horiz';
    if (this.props.expanded) {
      text = 'more_vert';
    }

    return <div className={cn} type="button" {...props}>{text}</div>;
  }
}
